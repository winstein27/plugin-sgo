/*

Ao cadastrar um ocorrência, consulta os endereços das ocorrências em andamento
para que o usuário não crie uma nova ocorrência com o mesmo endereço de uma já
cadastrada.

*/

const preparaOcorrencia = linha => {
    const natureza = linha.cells[1].innerText.replace("\n", "").trim();
    const endereco = linha.cells[2].innerText.replace("\n", "").trim();

    return [natureza, endereco];
};

// Ocorrência é recente se foi registrada há, no máximo, 2 horas
const ocorrenciaERecente = dataOcorrencia => {
    const ano = "20" + dataOcorrencia.slice(6, 8);
    const mes = dataOcorrencia.slice(3, 5);
    const dia = dataOcorrencia.slice(0, 2);
    const hora = dataOcorrencia.slice(9, 11);
    const minuto = dataOcorrencia.slice(12, 14);
    
    return ((new Date() - new Date(ano, mes-1, dia, hora, minuto)) / (1000*60*60) <= 2);
};

const getOcorrenciasPorEndereco = endereco => {
    const url = "https://sgo.ssp.df.gov.br/atendimento/emandamento?filtroCodAgencia=2";
    
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
                    const dataOcorrencia = linhas[i].cells[0].innerText.split("\n")[5].trim();

                    if(ocorrenciaERecente(dataOcorrencia) && enderecoCadastrado.toLowerCase().includes(endereco.toLowerCase())) {
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
    let enderecosHTML = `<table id=\"enderecos_semelhantes\"><thead><tr><th colspan="2">Ocorrêncios com Endereços Semelhantes</th></tr></thead><tbody>`;

    ocorrencias.forEach(ocorrencia => {
        enderecosHTML += "<tr><td>" + ocorrencia[0] + "</td><td> " + ocorrencia[1] + "</td></tr>";
    });

    return enderecosHTML + "</tbody></table>";
}

const limpaEnderecos = () => {
    const divEnderecos = document.getElementById("enderecos_semelhantes");
    
    if(divEnderecos) {
        divEnderecos.remove();
    }
}

const exibeOcorrencias = ocorrencias => {
    limpaEnderecos();

    if(ocorrencias.length) {
        const htmlEnderecos = preparaHTMLEnderecos(ocorrencias);
        const sectionEndereco = document.getElementsByClassName("divPrioridade")[1].getElementsByTagName("section")[3];
        
        sectionEndereco.insertAdjacentHTML("afterend", htmlEnderecos);
    }
}

document.getElementById("DSC_ENDERECO").addEventListener('input', event => {
    const endereco = event.target.value;
    
    if(Number.parseInt(endereco.length) >= 3) {
        getOcorrenciasPorEndereco(endereco).then(ocorrencias => {
            exibeOcorrencias(ocorrencias);
        }).catch(e => {
            console.log(e);
        });
    }

    limpaEnderecos();
});
