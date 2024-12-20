// Variável para armazenar arquivos enviados
let accumulatedFiles = [];

// Adicionar arquivos ao acumulador quando um novo arquivo for selecionado
document.getElementById("file").addEventListener("change", function () {
    const files = Array.from(this.files); // Transformar FileList em array

    // Adicionar arquivos ao acumulador evitando duplicatas
    files.forEach((file) => {
        if (!accumulatedFiles.some(accFile => accFile.name === file.name)) {
            accumulatedFiles.push(file);
        }
    });

    updateFileTable(); // Atualizar a tabela de arquivos
    updateConvertOptionsVisibility(); // Atualiza a visibilidade do botão e slider

    // Ocultar a seção de upload após o primeiro arquivo ser selecionado
    document.getElementById("fileUploadSection").style.display = "none";

    // Ocultar o aviso de drag and drop
    document.getElementById("avisoDrag").style.display = "none";

    // Limpar o input de arquivos para permitir reenvio do mesmo arquivo após remoção
    this.value = "";
});


// Função para formatar o tamanho do arquivo
function formatFileSize(size) {
    if (size < 1024) return size + " B";
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    let i = Math.floor(Math.log(size) / Math.log(k));
    return (size / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i - 1];
}

// Atualiza a tabela de arquivos exibida
function updateFileTable() {
    const fileTableBody = document.getElementById("fileTableBody");
    const fileListDiv = document.getElementById("fileList");

    fileTableBody.innerHTML = ""; // Limpa a tabela

    accumulatedFiles.forEach((file, index) => {
        const row = document.createElement("tr");

        // Nome do arquivo
        const nameCell = document.createElement("td");
        nameCell.textContent = file.name;
        row.appendChild(nameCell);

        // Tamanho do arquivo
        const sizeCell = document.createElement("td");
        sizeCell.textContent = formatFileSize(file.size); // Tamanho formatado
        row.appendChild(sizeCell);

        // Adiciona botão de remover
        const actionCell = document.createElement("td");
        actionCell.style.display = "flex";
        actionCell.style.justifyContent = "center";
        actionCell.style.alignItems = "center";
        actionCell.style.height = "100%"; // Use 100% para ocupar a altura da célula

        // Criar o botão com a nova estrutura HTML e classe 'btn'
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("removeButton");
        removeBtn.style.width = "100%" // Garante que o botão ocupa toda a largura da coluna
        removeBtn.innerHTML = `
            <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" class="icon">
            <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
            </svg>
        `;

        removeBtn.addEventListener("click", function () {
            removeFile(index);
            updateConvertOptionsVisibility();
        });

        actionCell.appendChild(removeBtn);
        row.appendChild(actionCell);

        // Adiciona a linha à tabela
        fileTableBody.appendChild(row);
    });

    // Mostrar a tabela se houver arquivos
    fileListDiv.style.display = accumulatedFiles.length > 0 ? "block" : "none";

    // Criação do botão de "Adicionar outro arquivo"
    const addFileRow = document.createElement("tr");
    const addFileCell = document.createElement("td");
    addFileCell.classList.add("addFileCell"); // Adiciona a classe para aplicar o estilo da célula

    const addFileBtn = document.createElement("button");
    addFileBtn.classList.add("addFileButton");  // Adiciona a classe do botão para aplicar o estilo
    addFileBtn.textContent = "Adicionar outro arquivo";
    addFileBtn.addEventListener("click", function () {
        document.getElementById("file").click(); // Abre o seletor de arquivos
    });

    addFileCell.appendChild(addFileBtn);
    addFileRow.appendChild(addFileCell);
    fileTableBody.appendChild(addFileRow);
}

// Remove um arquivo do acumulador e atualiza a tabela
function removeFile(index) {
    accumulatedFiles.splice(index, 1); // Remove o arquivo do acumulador
    updateFileTable(); // Atualiza a tabela de arquivos
    updateConvertOptionsVisibility(); // Atualiza a visibilidade

    // Verifica se a tabela está vazia após a remoção
    if (accumulatedFiles.length === 0) {
        // Recarrega a página
        location.reload();
    }
}

// Função para adicionar arquivos via Drag and Drop
function handleDroppedFiles(files) {
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
        if (!accumulatedFiles.some(accFile => accFile.name === file.name)) {
            accumulatedFiles.push(file);
        }
    });

    updateFileTable(); // Atualizar a tabela
    updateConvertOptionsVisibility(); // Atualiza a visibilidade

    // Ocultar a seção de upload após o primeiro arquivo ser selecionado
    document.getElementById("fileUploadSection").style.display = "none";
}

// Atualiza a visibilidade do botão e slider
function updateConvertOptionsVisibility() {
    const convertOptions = document.getElementById("convertOptions");
    const convertBtn = document.getElementById("convertBtn");


    if (accumulatedFiles.length > 0) {
        convertOptions.style.display = "block";
        convertBtn.style.display = "inline-block";
    } else {
        convertOptions.style.display = "none";
        convertBtn.style.display = "none";
    }
}

// Configuração do Drag and Drop
const overlay = document.createElement("div");
overlay.id = "dragOverlay";
overlay.style.display = "none";
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
overlay.style.zIndex = "1000"; // Um valor alto para z-index

// Adiciona um elemento de texto ao overlay
const overlayText = document.createElement("p");
overlayText.textContent = "Solte o(s) arquivo(s) para fazer upload";
overlayText.style.color = "#fff"; // Define a cor do texto
overlayText.style.fontSize = "2rem"; // Define um tamanho de texto maior
overlayText.style.textAlign = "center"; // Centraliza o texto
overlayText.style.position = "absolute"; // Posicionamento absoluto para centralizar na tela
overlayText.style.top = "50%";
overlayText.style.left = "50%";
overlayText.style.transform = "translate(-50%, -50%)"; // Centraliza o texto
overlay.appendChild(overlayText);
document.body.appendChild(overlay);

document.addEventListener("dragenter", function (e) {
    e.preventDefault();
    overlay.style.display = "block";
});

document.addEventListener("dragover", function (e) {
    e.preventDefault();
});

document.addEventListener("dragleave", function (e) {
    if (e.target === overlay) {
        overlay.style.display = "none";
    }
});

document.addEventListener("drop", function (e) {
    e.preventDefault();
    overlay.style.display = "none";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleDroppedFiles(files); // Adicionar arquivos via Drag and Drop
    }
});

// Clicou em Converter
document.getElementById("convertBtn").addEventListener("click", async function () {
    const convertBtn = document.getElementById("convertBtn");
    const downloadAllBtn = document.getElementById("downloadAllBtn");
    const messageDiv = document.getElementById("message");
    const fileUploadSection = document.getElementById("fileUploadSection");
    const actionsSection = document.getElementById("actionsSection");
    const fileTableBody = document.getElementById("fileTableBody");
    const actionColumn = document.getElementById("actionColumn");

    const formData = new FormData();

    // Adicionar arquivos acumulados ao FormData
    accumulatedFiles.forEach((file) => {
        formData.append("file", file);
    });

    // Capturar o valor do zoom selecionado
    const zoomValue = document.querySelector('input[name="zoom-radio"]:checked').value;
    formData.append("zoom", zoomValue);

    // Alterar o conteúdo do botão para o loader
    convertBtn.disabled = true;
    convertBtn.innerHTML = `<div class="loader"></div>`; // Substitui o conteúdo pelo loader

     // Desabilita os inputs do seletor de zoom
    document.querySelectorAll('input[name="zoom-radio"]').forEach(input => {
       input.disabled = true;
   });

    console.log("FormData antes do fetch", formData);
    console.log("Arquivos acumulados:", accumulatedFiles);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            const downloadUrl = data.download_url;

            fileUploadSection.style.display = "none";
            convertOptions.style.display = "none";
            actionsSection.style.display = "block";
            downloadAllBtn.style.display = "inline-block";

            // Atualizar tabela de downloads
            fileTableBody.innerHTML = "";

            console.log("Individual Files:", data.individual_files);
            data.individual_files.forEach((file) => {
                const row = document.createElement("tr");
            
                // Nome do arquivo
                const nameCell = document.createElement("td");
                nameCell.textContent = file.name;
                row.appendChild(nameCell);
            
                // Tamanho do arquivo
                const sizeCell = document.createElement("td");
                sizeCell.textContent = formatFileSize(file.size);
                row.appendChild(sizeCell);
            
                // Gerar botões de download
                const actionCell = document.createElement("td");
                const downloadBtn = document.createElement("div");
                downloadBtn.className = "downloadButton";
            

            
                const wrapper = document.createElement("div");
                wrapper.className = "button-wrapper";
            
                const text = document.createElement("div");
                text.className = "text";
                text.innerText = "";
            
                const icon = document.createElement("span");
                icon.className = "icon";
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path>
                </svg>`; 
            
                wrapper.appendChild(text);
                wrapper.appendChild(icon);
                downloadBtn.appendChild(wrapper);
            
                downloadBtn.addEventListener("click", function () {
                  const anchor = document.createElement("a");
                    anchor.href = `/download/${file.name}`;
                    anchor.download = file.name;
                    console.log("Baixando arquivo individual:", file.name);
                    document.body.appendChild(anchor);
                    anchor.click();
                    document.body.removeChild(anchor);
                });
            
                actionCell.appendChild(downloadBtn);
                row.appendChild(actionCell);
                fileTableBody.appendChild(row);
            });

            // Atualizar ação do botão "Baixar Todos"
            downloadAllBtn.replaceWith(downloadAllBtn.cloneNode(true));
            document.getElementById("downloadAllBtn").addEventListener("click", function () {
                const anchor = document.createElement("a");
                anchor.href = downloadUrl;
                anchor.download = "arquivos_convertidos.zip";
                 console.log("Baixando todos os arquivos:", downloadUrl); // Log antes do download geral
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
            });

        } else {
            const errorData = await response.json();
            messageDiv.innerHTML = `<p style="color: red;">Erro: ${errorData.error}</p>`;
        }
    } catch (error) {
        console.error("Erro durante a conversão:", error);
        messageDiv.innerHTML = `<p style="color: red;">Erro na conversão. Tente novamente.</p>`;
    }

// Restaura o conteúdo do botão após a conversão
     convertBtn.disabled = false;
     convertBtn.innerHTML = "Converter"; // Altere de volta o conteúdo para "Converter"

     // Reabilita os inputs do seletor de zoom
     document.querySelectorAll('input[name="zoom-radio"]').forEach(input => {
        input.disabled = false;
    });

});

// Botão de voltar para enviar novos arquivos
document.getElementById("backButton").addEventListener("click", function () {
    location.reload(); // Recarrega a página completamente
});
