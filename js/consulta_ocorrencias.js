const preparaOcorrencia = linha => {
    const natureza = linha.cells[1].innerText.replace("\n", "").trim();
    const endereco = linha.cells[2].innerText.replace("\n", "").trim();

    return [natureza, endereco];
};

const consultaOcorrenciasPorEndereco = endereco => {
    const url = "/teleatendimentocbmdf/emandamento";
    
    return new Promise(resolve => {
        const ocorrencias = [];

        fetch(url).then(response => {
            const paginaRetornada = document.createElement('html');

            response.text().then(data => {
                paginaRetornada.innerHTML = data;
    
                const tabela = paginaRetornada.getElementsByTagName("tbody")[0];
                const linhas = Array.from(tabela.rows);
    
                for(let i=0; i<linhas.length; i++) {
                    const enderecoCadastrado = linhas[i].cells[2].innerText.split("/")[0];
                    if(enderecoCadastrado.toLowerCase().includes(endereco.toLowerCase())) {
                        ocorrencias.push(preparaOcorrencia(linhas[i]));
                    }
                }
                resolve(ocorrencias);
            });
        });
    }).catch(error => {
        console.log(error);
    });
};

const preparaHTMLEnderecos = ocorrencias => {
    let enderecosHTML = "<div id=\"enderecos_semelhantes\">";

    ocorrencias.forEach(ocorrencia => {
        enderecosHTML += "<p>" + ocorrencia[0] + " | " + ocorrencia[1] + "</p>";
    });

    return enderecosHTML + "</div>";
}

const limpaEnderecos = () => {
    const divEnderecos = document.getElementById("enderecos_semelhantes");
    
    if(divEnderecos) {
        divEnderecos.remove();
    }
}

const exibeOcorrencias = ocorrencias => {
    limpaEnderecos();

    const htmlEnderecos = preparaHTMLEnderecos(ocorrencias);
    const sectionEndereco = document.getElementsByClassName("divPrioridade")[1].getElementsByTagName("section")[3];

    sectionEndereco.insertAdjacentHTML("afterend", htmlEnderecos);
}

document.getElementById("DSC_ENDERECO").addEventListener('input', event => {
    const endereco = event.target.value;

    if(Number.parseInt(endereco.length) >= 3) {
        consultaOcorrenciasPorEndereco(endereco).then(ocorrencias => {
            exibeOcorrencias(ocorrencias);
        }).catch(e => {
            console.log(e);
        });
    }

    limpaEnderecos();
});
