/*

Cria um alerta e reposiciona ocorrências que foram compartilhadas com o CBMDF,
desde que não tenham sido depachadas para os quartéis operacionais ou não
tenham desfecho pela mesa da COCB.

*/

const reposicionaEDestacaOcorrencia = (tabelaOcorrencias, linha) => {
    const mensagem = `<p id="ocorrenciaDestacada">Ocorrência sem tratamento pelo CBMDF.</p>`
    const itemTablela = linha.getElementsByTagName("td")[0];
    
    itemTablela.insertAdjacentHTML("beforeend", mensagem);
    tabelaOcorrencias.insertAdjacentElement("afterbegin", itemTablela.parentNode);
}

const consulta_ocorrencias = tabelaOcorrencias => {
    const linhas = Array.from(tabelaOcorrencias.rows);
    
    linhas.filter(linha => {
        const link_ocorrencia = linha.getElementsByTagName("td")[0].getElementsByTagName("a")[0];
        const numeroOcorrencia = link_ocorrencia.innerText;
        let ocorrenciaFoiDespachada = true;
        
        // Ocorrências compartilhadas por órgãos externos possuem numeração diferente de 002
        if(numeroOcorrencia.replace(/\D/g,"").substring(8, 11) !== "002") {
            ocorrenciaFoiDespachada = false;
            const url = link_ocorrencia.href;
            fetch(url).then(response => {
                response.text().then(detalhesOcorrencia => {
                    const paginaOcorrencia = document.createElement("html");
                    paginaOcorrencia.innerHTML = detalhesOcorrencia;
    
                    let titulosHistoricoAtendimentos = Array.from(paginaOcorrencia.getElementsByClassName("panel-title"));
                    
                    titulosHistoricoAtendimentos.forEach(tituloHistorico => {
                        const titulo = tituloHistorico.innerText;
                        if(titulo.match(/MESA.*CBMDF/)) {
                            ocorrenciaFoiDespachada = tituloHistorico.nextSibling.data.trim() !== "Tipo Desfecho:";
                        }
                    });
    
                    if(!ocorrenciaFoiDespachada) {
                        titulosHistoricoAtendimentos = titulosHistoricoAtendimentos.filter(titulo => !titulo.innerText.match(/MESA.*CBMDF/));
                        ocorrenciaFoiDespachada = titulosHistoricoAtendimentos.find(titulo => titulo.innerText.includes("CBMDF")) !== undefined;
                    }

                    if(!ocorrenciaFoiDespachada) {
                        reposicionaEDestacaOcorrencia(tabelaOcorrencias, linha);
                    }
                });
            });
        }
    });
}

const alerta_compartilhamento = () => {
    const tabela_ocorrencias = document.getElementsByTagName("tbody")[0];
    consulta_ocorrencias(tabela_ocorrencias);
}

alerta_compartilhamento();
