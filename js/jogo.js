var APOSTA_MINIMA = 5;
var APOSTA_MAXIMA = 200;
var QTDE_BARALHOS = 4;
var QTDE_CARTAS = 52;
var qtde_partidas = 0;
var mais_uma;
var dinheiro_atual;
var total_cartas;
var fase_atual;
var aposta_jogador;
var aposta_banca;
var cartas_jogador;
var cartas_banca;
var baralho;
var pontos_jogador1;
var pontos_jogador2;
var pontos_banca1;
var pontos_banca2;
var total_apostas;
var tipo_jogo;


fase_inicial = function()
{
    proxFase();
}

fase_apostas = function()
{
    if (qtde_partidas == 0)
        initBotoesAposta();
    $('#minhas-apostas').show();
}

fase_distribuir = function()
{
    qtde_partidas++;
    adicionarCartaNaMesa(true, 2);
    adicionarCartaNaMesa(false, 2);
    proxFase();
}

fase_acoes = function()
{
    $('#area-opcoes').show();
    if (qtde_partidas == 1)
        initBotoesOpcoes();
}

fase_banca = function()
{
    $('#area-opcoes').show();
    if (!estourou(true))
    {
        contarPontos();
        while (pontos_banca1 <= 15 || pontos_banca2 <= 15)
        {
            adicionarCartaNaMesa(false, 1);
            contarPontos();
        }
    }
    proxFase();
}

fase_resultado = function()
{
    revelarCartaBanca();
    if (estourou(true))
    {
        msg_final = 'Você perdeu. =(';
        tipo_jogo = 3;
    }
    else
    {
        if (estourou(false))
        {
            msg_final = 'A banca estourou. Parabéns, você venceu! =D';
            tipo_jogo = 1;
            receberAposta(false);
        }
        else
        {
            pontuacao_jogador = getPontuacaoFinal(true);
            pontuacao_banca = getPontuacaoFinal(false);

            string_pontos = getStringResultado(pontuacao_jogador, pontuacao_banca);
            if (pontuacao_jogador > pontuacao_banca)
            {
                msg_final = 'Você fez mais pontos que a banca. Parabéns, você venceu! =D';
                tipo_jogo = 1;
                receberAposta(false);
            }
            else
            {
                if (pontuacao_jogador == pontuacao_banca)
                {
                    msg_final = 'Houve um empate. =|';
                    tipo_jogo = 2;
                    receberAposta(true);
                }
                else
                {
                	msg_final = 'A banca fez mais pontos. Você perdeu. =(';
                	tipo_jogo = 3;
                }
            }

            msg_final += string_pontos;
        }
    }

    alert(msg_final);
    proxFase();
}

fase_final = function()
{
    atualizarDinheiroAtual();
	$.ajax({
	    type: 'post',
	    data: 'dinheiro_atual=' + dinheiro_atual + '&tipo=' + tipo_jogo,
	    url: 'atualizar_partida.php',
	    success: function() {
	    	if (qtde_partidas == 1)
	            initBotoesResultado();
	        $('#area-resultado').show();
	    }
	})
}

var fases = [fase_apostas, fase_distribuir, fase_acoes, fase_banca, fase_resultado, fase_final];


/*
    Em caso de vitória ou empate (os 2 casos em que você recebe dinheiro),
    é atribuido para o jogador o valor correspondente.
*/
function receberAposta(empate)
{
    if (empate)
    {
        dinheiro_atual += parseInt(aposta_jogador);
    }
    else
    {
        dinheiro_atual += total_apostas;
        alert('Parabéns, você ganhou: R$' + total_apostas + ',00');
    }

    atualizarDinheiroAtual();
}

/*
    "Remove" todas as cartas da mesa, deixando apenas os "slots"
*/
function limparMesa()
{
    $('#minhas-cartas .carta, #area-banca .carta').addClass('sem-carta');
    $('.img-naipe').removeClass('paus ouros copas espadas');
    $('.valor').removeClass('font-red font-black');
    $('#txt-aposta').val('');
    $('.valor').empty();
}

/*
    Retorna a pontuação do jogo
*/
function getStringResultado(pontuacao_jogador, pontuacao_banca)
{
    msg = "\n\n\n";
    msg += "Jogador: " + pontuacao_jogador + "\n";
    msg += "Banca: " + pontuacao_banca + "\n";
    msg += "\n";
    return msg;
}

/*
    Caso não tenha estourado, retorna a sua melhor pontuação
*/
function getPontuacaoFinal(jogador)
{
    contarPontos();
    if (jogador)
    {

        if (pontos_jogador1 > pontos_jogador2)
        {
            if (pontos_jogador1 <= 21)
                return pontos_jogador1;
            else
                return pontos_jogador2;
        }
        else
        {
            if (pontos_jogador2 <= 21)
                return pontos_jogador2;
            else
                return pontos_jogador1;
        }
    }
    else
    {
        if (pontos_banca1 > pontos_banca2)
        {
            if (pontos_banca1 <= 21)
                return pontos_banca1;
            else
                return pontos_banca2;
        }
        else
        {
            if (pontos_banca2 <= 21)
                return pontos_banca2;
            else
                return pontos_banca1;
        }
    }
}

/*
    Adiciona X cartas na mesa do jogador ou da banca
*/
function adicionarCartaNaMesa(jogador, qtde)
{
    for (var i = 1; i <= qtde; i++)
    {
        if (jogador)
            id = '#slot-jogador' + (cartas_jogador.length + 1);
        else
            id = '#slot-banca' + (cartas_banca.length + 1);

        carta = getCartaBaralho();
        adicionarCartaNaPosicao(carta, id);

        if (jogador)
            cartas_jogador[cartas_jogador.length] = carta;
        else
            cartas_banca[cartas_banca.length] = carta;
    }

    esconderCartaBanca();
}

/*
    Adiciona determinada carta no slot apropriado
*/
function adicionarCartaNaPosicao(carta, id)
{
    cor = getCorNaipe(carta['naipe']);
    $(id + ' .valor').addClass(cor);
    $(id + ' .valor').html(carta['numero']);
    $(id + ' .img-naipe').addClass(carta['naipe']);
    $(id).removeClass('sem-carta');
}

/*
    Verifica se ou o jogador ou a banca estouraram
*/
function estourou(jogador)
{
    if (jogador)
        return ((pontos_jogador1 > 21) && (pontos_jogador2 > 21));
    else
        return ((pontos_banca1 > 21) && (pontos_banca2 > 21));
}

/*
    Realiza a contagem de pontos do jogador e da banca
*/
function contarPontos()
{
    pontos_jogador1 = 0;
    pontos_jogador2 = 0;
    pontos_banca1 = 0;
    pontos_banca2 = 0;

    for (var i = 0; i < cartas_jogador.length; i++)
    {
        vl = cartas_jogador[i]['valor'];
        if (vl == 0)
        {
            pontos_jogador1 += 1;
            pontos_jogador2 += 11;
        }
        else
        {
            pontos_jogador1 += vl;
            pontos_jogador2 += vl;
        }
    };

    for (var i = 0; i < cartas_banca.length; i++)
    {
        vl = cartas_banca[i]['valor'];
        if (vl == 0)
        {
            pontos_banca1 += 1;
            pontos_banca2 += 11;
        }
        else
        {
            pontos_banca1 += vl;
            pontos_banca2 += vl;
        }
    };
}

/*
    De acordo com o naipe, retorna a classe da cor apropriada
*/
function getCorNaipe(naipe)
{
    if ((naipe == 'copas') || (naipe == 'ouros'))
        return 'font-red';
    else
        return 'font-black';
}

/*
    Função que retorna a última carta do baralho
*/
function getCartaBaralho()
{
    total_cartas--;
    carta = baralho[total_cartas];
    return carta;
}

/*
    Fecha todos os paineis de msg e opções
*/
function fecharPaineis()
{
    $('#minhas-apostas, #area-opcoes, #area-resultado').hide();
}

/*
    Coloca uma das cartas da banca virada para baixo
*/
function esconderCartaBanca()
{
    $('#slot-banca1').addClass('fundo-carta');
    $('#slot-banca1').empty();
}

function revelarCartaBanca()
{
    carta_escondida = cartas_banca[0];

    html_carta = ''
        + '<span class="valor"></span>'
        + '<div class="img-naipe"></div>';

    $('#slot-banca1').html(html_carta);
    adicionarCartaNaPosicao(carta_escondida, '#slot-banca1');
    $('#slot-banca1').removeClass('fundo-carta');
}

/*
    Atualiza o painel de apostas de acordo com o total das apostas
*/
function atualizarApostas()
{
    $('#total-apostas').empty();
    $('#total-apostas').html('R$' + total_apostas + ',00');
}

/*
    Atualiza o quadro do dinheiro atual do jogador
*/
function atualizarDinheiroAtual()
{
    $('#label-dinheiro-atual').empty();
    $('#label-dinheiro-atual').html('R$' + dinheiro_atual + ',00');
}

/*
    Inicia os botões de resultado
*/
function initBotoesResultado()
{
    $('#btn-sobre').click(function(){
        alert('Jogo feito por: \nAlexandre Jorge Castanheira\nMônica dos Santos Gonçalves\n\nEsperamos que tenham gostado. :)');
    });

    $('#btn-novo-jogo').click(function(){
        jogo();
    });
}

/*
    Atribui os eventos dos botões de opções
*/
function initBotoesOpcoes()
{
    $('#btn-opcao-double').click(function(){
        if (!mais_uma)
        {
            dinheiro_atual -= aposta_jogador;
            total_apostas += total_apostas;
            aposta_jogador += aposta_jogador;
            adicionarCartaNaMesa(true, 1);
            atualizarDinheiroAtual();
            atualizarApostas();
            proxFase();
        }
        else
        {
            alert('Você não pode dobrar após pedir uma carta.')
        }
    });

    $('#btn-opcao-hit').click(function(){
        mais_uma = true;
        adicionarCartaNaMesa(true, 1);
        contarPontos();
        if (estourou(true)) proxFase();
    });

    $('#btn-opcao-stand').click(function(){
        proxFase();
    });

    $('#btn-opcao-surrender').click(function(){
        if (!mais_uma)
        {
            metade_aposta = aposta_jogador / 2;
            alert('Você se rendeu, irá receber de volta metade de sua aposta: R$' + metade_aposta);
            dinheiro_atual += metade_aposta;
            atualizarDinheiroAtual();
            tipo_jogo = 3;
            fecharPaineis();
            fases[5]();
        }
        else
        {
            alert('Você não pode se render após pedir uma carta!');
        }
    });
}

/*
    Atribui os eventos dos botões de aposta
*/
function initBotoesAposta()
{
    $('#btn-aposta-minima').click(function(){
        $('#txt-aposta').val(APOSTA_MINIMA);
    });

    $('#btn-aposta-maxima').click(function(){
       $('#txt-aposta').val(APOSTA_MAXIMA);
    });

    $('#btn-finalizar-aposta').click(function(){
        valor_aposta = $('#txt-aposta').val();

        if (valor_aposta < APOSTA_MINIMA)
        {
            alert('A aposta mínima é: R$' + APOSTA_MINIMA + ',00');
        }
        else
        {
            if (valor_aposta > APOSTA_MAXIMA)
            {
                alert('A aposta máxima é: R$' + APOSTA_MAXIMA + ',00');
            }
            else
            {
                //a aposta é valida
                aposta_banca = valor_aposta;
                aposta_jogador = valor_aposta;
                recolherAposta(parseInt(aposta_jogador));
                total_apostas = parseInt(aposta_banca) + parseInt(aposta_jogador);
                atualizarDinheiroAtual();
                atualizarApostas();
                proxFase();
            }
        }
    });
}

/*
    Recolhe a aposta do jogador
*/
function recolherAposta(aposta)
{
    dinheiro_atual -= aposta;
}

/*
    Função feita, para ordenar os jogadores pelop seu dinheiro, já que nem sempre o retorno do JSON era confiável
*/
function ordenar_jogadores(jogadores)
{
    var itera = true;
    retorno = jogadores;
    while (itera)
    {
        itera = false;
        for (var i = 0; i < jogadores.length ; i++)
        {
            //se o próx jogador da iteração tem mais dinheiro, ele é colocado na posição da frente
            if (i <= (retorno.length - 2))
            {

                if (parseInt(retorno[i][1]) < parseInt(retorno[i + 1][1]))
                {
                    temp = retorno[i];
                    retorno[i] = retorno[i +1];
                    retorno[i +1] = temp;
                    itera = true;
                }
            }
        }
    }
    return retorno;
}

/*
    Atualiza o painel de jogadores mais ricos
*/
function atualizarMaisRicos(jogadores)
{
    jogadores = ordenar_jogadores(jogadores);
    $('#lista-ranking tbody').empty();
    for (var i = 1; i <= jogadores.length; i++) {
        j = jogadores[i - 1];
        evento_onclick = 'onClick="$(\'#detalhe-jogador-' + i + '\').toggle();"';
        _html = ''
            + '<tr class="expandir-detalhe tip" title="Clique para ver informações detalhadas deste jogador">'
            + '    <td> <span ' + evento_onclick + '>' + i + 'º </span> </td>'
            + '    <td> <span ' + evento_onclick + '>' + j[0] + '</span> </td>'
            + '    <td> <span ' + evento_onclick + '> R$' + j[1] + ',00 </span> </td>'
            + '</tr>'
            + '<tr id="detalhe-jogador-' + i + '" class="detalhe-jogador">'
            + '    <td colspan="3">'
            + '        <ul>'
            + '            <li>'
            + '                <div class="titulo-detalhe-jogador">Vitórias: </div>'
            + '                <div class="valor-detalhe-jogador">' + j[2] + '</div>'
            + '            </li>'
            + '            <li>'
            + '                <div class="titulo-detalhe-jogador">Empates: </div>'
            + '                <div class="valor-detalhe-jogador">' + j[3] + '</div>'
            + '            </li>'
            + '            <li>'
            + '                <div class="titulo-detalhe-jogador">Derrotas: </div>'
            + '                <div class="valor-detalhe-jogador">' + j[4] + '</div>'
            + '            </li>'
            + '            <li>'
            + '                <div class="titulo-detalhe-jogador">Maior valor obtido: </div>'
            + '                <div class="valor-detalhe-jogador"> R$ ' + j[5] + ',00 </div>'
            + '            </li>'
            + '            <li>'
            + '                <div class="titulo-detalhe-jogador">Menor valor obtido: </div>'
            + '                <div class="valor-detalhe-jogador"> R$ ' + j[6] + ',00 </div>'
            + '            </li>'
            + '        </ul>'
            + '    </td>'
            + '</tr>'
            + '<tr>'
            + '    <td colspan="3" class="delimitador-lista-ranking"></td>'
            + '</tr>';

        $('#lista-ranking tbody').append(_html);
    };
}

/*
    Executa a próxima fase do jogo
*/
function proxFase()
{
    fecharPaineis();
    fase_atual++;
    fases[fase_atual]();
}

/*
    Função que cria o baralho do jogo
*/
function criarBaralho(embaralha)
{
    var naipes = ['copas', 'espadas', 'ouros', 'paus'];
    var numeros = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
    var novo_baralho = {}

    for (var naipe_pos = 0; naipe_pos < 4; naipe_pos++)
    {
        naipe_atual = naipes[naipe_pos];
        for (var numero_pos = 0; numero_pos < numeros.length; numero_pos++)
        {
            numero_atual = numeros[numero_pos];
            if (numero_atual === 'A')
            {
                valor_atual = 0;
            }
            else
            {
                if (typeof numero_atual === 'number')
                    valor_atual = numero_atual;
                else
                    valor_atual = 10;
            }

            var carta = {
                'naipe': naipe_atual,
                'numero': numero_atual,
                'valor': valor_atual,
            };

            novo_baralho[total_cartas] = carta;
            total_cartas++;
        }
    }
    if (embaralha)
        novo_baralho = embaralhar(novo_baralho, 10);

    return novo_baralho;
}

/*
    Função que embaralha o baralho do jogo, recebe como parametro a qtde de vezes que será embaralhado
*/
function embaralhar(sourceArray, vezes)
{
    for (var i = 0; i < vezes; i++) {
        for (var n = 0; n < total_cartas; n++) {
            var k = n + Math.floor(Math.random() * (total_cartas - n));
            var temp = sourceArray[k];
            sourceArray[k] = sourceArray[n];
            sourceArray[n] = temp;
        }
    };

    return sourceArray;
}

/**
 * Verifica se um valor é numérico ou não
 * @param  {[type]}  str [description]
 * @return {Boolean}     [description]
 */
function isNumeric(str) 
{   
    var er = /^[0-9]+$/;   
    return (er.test(str)); 
} 

/*
    Função que organiza a estrutura do jogo
*/
function jogo()
{
    $.ajax({
        type: 'post',
        url: 'atualizar.php',
        success: function(retorno) {
            temp = retorno.usuario.dinheiro_atual;
            if (isNumeric(temp))
                dinheiro_atual = parseInt(temp);    
            else
                dinheiro_atual = 1000;
            
            atualizarMaisRicos(retorno.mais_ricos);

            mais_uma = false;
            fase_atual = -1;
            pos_baralho = 0;
            pontuacao_banca = 0;
            pontuacao_jogador = 0;
            pontos_jogador1 = 0;
            pontos_jogador2 = 0;
            pontos_banca1 = 0;
            pontos_banca2 = 0;
            total_apostas = 0;
            total_cartas = 0;
            cartas_jogador = [];
            cartas_banca = [];
            baralho = criarBaralho(true);
            limparMesa();
            atualizarDinheiroAtual();
            atualizarApostas();

            proxFase();
        },
        error: function (){
            alert('Não foi possível acessar o servidor, tente novamente mais tarde.')
        }
    })
}

/*
    Inicia os componentes assim que possível
*/
$(document).ready(function(){
    $('#logoff').click(function(){
        $.ajax({
            type: 'get',
            url: 'logoff.php',
            success: function() {
                alert('Logoff realizado com sucesso!');
                window.location = 'http://localhost/blackjackfatec/';
            }
        });
    });

    $('#regras').click(function(){
        $( "#dialog-message" ).dialog({
            modal: true,
            width: 700,
            height: 500,
            buttons: {
                'Já entendi!': function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    });

    $('#quem-somos').click(function(){
        if ($('#quem-somos').html() == 'Quem somos')
        {
            $('#quem-somos').html('Voltar');
            $('#contato').html('Fale conosco');
            $('#menu-quem-somos').show();
            $('#menu-ranking, #menu-contato').hide();
        }
        else
        {
            $('#quem-somos').html('Quem somos');
            $('#contato').html('Fale conosco');
            $('#menu-quem-somos, #menu-contato').hide();
            $('#menu-ranking').show();
        }
    });

    $('#contato').click(function(){
        if ($('#contato').html() == 'Fale conosco')
        {
            $('#contato').html('Voltar');
            $('#quem-somos').html('Quem somos');
            $('#menu-quem-somos, #menu-ranking').hide();
            $('#menu-contato').show();
        }
        else
        {
            $('#contato').html('Fale conosco');
            $('#quem-somos').html('Quem somos');
            $('#menu-quem-somos, #menu-contato').hide();
            $('#menu-ranking').show();
        }
    });

    $('#submit-form-contato').click(function(){
        alert('Mensagem de contato enviado com sucesso!');
    });

    $('#btn-cadastrar, #btn-logar').click(function(){
        $('#form-cadastro, #form-login').toggle();
    });

    jogo();
});


