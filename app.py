from flask import Flask, request, send_file, jsonify, render_template
import fitz  # PyMuPDF
import os
import shutil
import threading
import time
import uuid

app = Flask(__name__)

# Diretórios de Upload e Convertidos
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

CLEANUP_INTERVAL = 300  # Intervalo de limpeza em segundos (5 minutos)

# Lista cumulativa de arquivos enviados
uploaded_files = {}

# Função para limpar os arquivos convertidos periodicamente
def cleanup_converted_files():
    while True:
        time.sleep(CLEANUP_INTERVAL)
        for folder in os.listdir(CONVERTED_FOLDER):
            folder_path = os.path.join(CONVERTED_FOLDER, folder)
            if os.path.isdir(folder_path):
                shutil.rmtree(folder_path)

# Rodar a limpeza em uma thread separada
threading.Thread(target=cleanup_converted_files, daemon=True).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    global uploaded_files

    files = request.files.getlist('file')
    zoom = float(request.form.get('zoom', 1))

    if not files or all(file.filename == '' for file in files):
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    # Criar uma pasta temporária com um UUID único para cada conversão
    temp_folder = os.path.join(CONVERTED_FOLDER, str(uuid.uuid4()))
    os.makedirs(temp_folder, exist_ok=True)

    zip_filename = "arquivos_convertidos.zip"
    zip_filepath = os.path.join(CONVERTED_FOLDER, zip_filename)

    individual_folders = []

    for file in files:
        if file.filename == '' or not file.filename.endswith('.pdf'):
            continue

        # Verificar se o arquivo já foi enviado, renomear se necessário
        original_filename = file.filename
        counter = 1
        temp_filename = file.filename #Cria variável para manipular o nome do arquivo dentro da função
        while temp_filename in uploaded_files.values():
          temp_filename = f"{os.path.splitext(original_filename)[0]}_{counter}{os.path.splitext(original_filename)[1]}"
          counter += 1

        uploaded_files[temp_filename] = temp_filename
        pdf_path = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(pdf_path)

        doc = fitz.open(pdf_path)
        pdf_folder_name = temp_filename.replace('.pdf', '_converted')
        pdf_folder_path = os.path.join(temp_folder, pdf_folder_name)
        os.makedirs(pdf_folder_path, exist_ok=True)

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            png_filename = f"{pdf_folder_name}_{page_num + 1}.png"
            png_path = os.path.join(pdf_folder_path, png_filename)
            pix.save(png_path)

        doc.close()
        
        # Compactar a pasta individual dentro da pasta temporária
        individual_zip_path = os.path.join(temp_folder, f"{pdf_folder_name}.zip")
        shutil.make_archive(individual_zip_path.replace('.zip', ''), 'zip', temp_folder, pdf_folder_name)
        individual_folders.append({
            "name": f"{pdf_folder_name}.zip",
            "size": os.path.getsize(individual_zip_path)  # Incluindo o tamanho do arquivo
        })
        
    # Compactar todos os arquivos juntos
    shutil.make_archive(zip_filepath.replace('.zip', ''), 'zip', temp_folder)

    # Mover o zip individual para a pasta de converted após a compactação
    for folder in individual_folders:
      original_path = os.path.join(temp_folder, folder["name"])
      final_path = os.path.join(CONVERTED_FOLDER, folder["name"])
      shutil.move(original_path, final_path)
    
    shutil.rmtree(temp_folder)
    
    # Retornar a resposta com os arquivos e seus tamanhos
    return jsonify({
        "status": "ok",
        "download_url": f"/download/{zip_filename}",
        "individual_files": individual_folders,
        "uploaded_files": list(uploaded_files.values())
    })

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(CONVERTED_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True, download_name=filename)
    else:
        return jsonify({"error": "Arquivo não encontrado"}), 404

@app.route('/clear_converted', methods=['POST'])
def clear_converted():
    global uploaded_files
    try:
        uploaded_files.clear()
        for filename in os.listdir(CONVERTED_FOLDER):
            file_path = os.path.join(CONVERTED_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        return jsonify({"message": "Arquivos convertidos apagados com sucesso."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)