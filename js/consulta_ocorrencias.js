const preparaOcorrencia = linha => {
    const natureza = linha.cells[1].innerText.replace("\n", "").trim();
    const endereco = linha.cells[2].innerText.replace("\n", "").trim();

    return [natureza, endereco];
};

const consultaOcorrenciasPorEndereco = async endereco => {
    const url = "/teleatendimentocbmdf/emandamento";
    
    fetch(url).then(function(response) {
        return new Promise(resolve => {
            const ocorrencias = [];
    
            const paginaRetornada = document.createElement('html');
            response.text().then(function(data) {
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
    }).catch(function(error) {
        console.log(error);
    });
};

const exibeOcorrencias = ocorrencias => {
    console.log(ocorrencias);
}

document.getElementById("DSC_ENDERECO").addEventListener('input', function(event) {
    const endereco = event.target.value;

    if(Number.parseInt(endereco.length) >= 3) {
        consultaOcorrenciasPorEndereco(endereco).then(ocorrencias => {
            console.log("xd!");
            exibeOcorrencias(ocorrencias);
        });
    }
});
