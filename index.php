<?php
    if (!empty($_POST)) {
	$username = 'u160480561_user';
	$password = 'zWQ0UjXYeE';
	$host = 'mysql.hostinger.com.br';
	$database = 'u160480561_black';
	$executa = TRUE;
	$msg_erro = '';

	if ($_POST['login'])
	{
        if (!session_id()) {
            session_start();
        }
        else
        {
            session_destroy();
            session_unset();
            unset($_SESSION['email']);
            session_start();
        }

		$email = mysql_real_escape_string($_POST['email']);
		$senha = mysql_real_escape_string($_POST['senha']);

		if (empty($email))
		{
			$executa = FALSE;
			$msg_erro .= 'Por favor, digite o campo <b>email</b>.';
		}

		if (empty($senha))
		{
			$executa = FALSE;
			$msg_erro .= 'Por favor, digite o campo <b>senha</b>.';
		}

		if ($executa)
		{
			$conn = mysql_connect($host, $username, $password);

			if ($conn)
			{
				mysql_select_db($database);
				$senha = md5($senha);
				$result = mysql_query("SELECT * FROM usuarios WHERE email = '{$email}' and senha = '{$senha}' LIMIT 1");

				$resultado = mysql_fetch_assoc($result);
				$email_ok = ($resultado['email'] == $email);

				if ($email_ok)
                {
					$_SESSION['email'] = $email;
                }
				else
                {
					$msg_erro = 'Login ou senha incorretos, por favor, tente novamente.';
                    session_destroy();
                    session_unset();
                    unset($_SESSION['email']);
                }
			}
			else
			{
				$msg_erro .= 'Não foi possível conectar-se ao banco de dados.';
			}

			mysql_close($conn);
		}
	}
	else
	{
		if ($_POST['cadastrar'])
		{
			$nome = mysql_real_escape_string($_POST['nome_cadastro']);
			$email = mysql_real_escape_string($_POST['email_cadastro']);
			$senha = mysql_real_escape_string($_POST['senha_cadastro']);
			$senha2 = mysql_real_escape_string($_POST['senha2_cadastro']);

			if (empty($nome))
			{
				$executa = FALSE;
				$msg_erro .= 'Por favor, digite o campo <b>nome</b>.';
			}

			if (empty($email))
			{
				$executa = FALSE;
				$msg_erro .= 'Por favor, digite o campo <b>email</b>.';
			}

			if (empty($senha))
			{
				$executa = FALSE;
				$msg_erro .= 'Por favor, digite o campo <b>senha</b>.';
			}

			if ($senha != $senha2)
			{
				$executa = FALSE;
				$msg_erro .= 'Por favor, certifique-se que o campo de <b>confirmação de senha</b> esteja correto.';
			}

			if ($executa)
			{
				$conn = mysql_connect($host, $username, $password);

				if ($conn)
				{
					//verifica se existe um email idêntico cadastrado
					mysql_select_db($database);
					$existe_email_result = mysql_query("SELECT * FROM usuarios WHERE email = '{$email}' LIMIT 1");

					$resultado = mysql_fetch_assoc($existe_email_result);
					$email_existe = ($resultado['email'] == $email);

					if ($email_existe)
					{
						$msg_erro = 'Este e-mail já está cadastrado no banco de dados, por favor, informe outro..';
					}
					else
					{
						mysql_select_db($database);
						$criacao = date('Y-m-d H:i:s');
						$senha = md5($senha);
						$sql = "
							INSERT INTO usuarios (
								nome, email, senha, criacao, qt_vitorias, qt_derrotas, qt_empates, dinheiro_atual, maior_valor_obtido, menor_valor_obtido, status
							) VALUES (
								'{$nome}', '{$email}', '{$senha}', '{$criacao}', 0, 0, 0, 1000, 1000, 1000, 1
							)
						";

						$result = mysql_query($sql, $conn);

						if ($result)
							$_SESSION['email'] = $email;
						else
							$msg_erro = mysql_error();
					}
				}
				else
				{
					$msg_erro .= 'Não foi possível conectar-se ao banco de dados.';
				}

				mysql_close($conn);
			}
		}
	}
}

//echo 'erro: ' . $msg_erro;
$usuario_logado = isset($_SESSION['email']);

?>

<!DOCTYPE HTML>
<html>
<head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="js/jquery-ui-1.10.3/themes/base/jquery-ui.css" />
    <script type="text/javascript" src="js/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui-1.10.3/ui/jquery-ui.js"></script>
    <script type="text/javascript" src="js/jogo.js"></script>
    <link rel="stylesheet" href="css/estilos.css" type="text/css" />
</head>
<body>
	<div id="fb-root"></div>
	<script>(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/pt_BR/all.js#xfbml=1";
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));</script>

    <div style="margin: 0 auto; width: 900px;">
    <div id="area">
    <?php if (!$usuario_logado) { ?>

        <h1>Para jogar é necessário se logar :) </h1>

        <?php if (!empty($msg_erro)) { ?>
            <p id="msg-erro"><?php echo $msg_erro; ?></p>
        <?php } ?>

        <form method="post" id="form-login">
            <p>
                <input type="email" id="login" name="email" autofocus required autofocus placeholder="E-mail:">
            </p>
            <p>
                <input type="password" name="senha" id="senha" required placeholder="Senha:">
                <input type="submit" name="login" value="Logar" id="submit-login">
            </p>
            <p class="msg-btn-form">
                <a id="btn-cadastrar">Ainda não sou cadastrado :(</a>
            </p>
        </form>

        <form method="post" id="form-cadastro">
            <p>
                <input type="text" name="nome_cadastro" placeholder="Digite o seu nome: " required>
            </p>
            <p>
                <input type="email" name="email_cadastro" placeholder="Digite o seu e-mail: " required>
            </p>
            <p>
                <input type="password" name="senha_cadastro" placeholder="Digite sua senha: " required>
            </p>
            <p>
                <input type="password" name="senha2_cadastro" placeholder="Confirme sua senha: " required>
            </p>
            <p>
                <input type="submit" value="Cadastrar" name="cadastrar" id="submit-cadastro">
            </p>
            <p class="msg-btn-form">
                <a id="btn-logar">Já sou cadastrado, quero me logar! :D</a>
            </p>
        </form>

    <?php } else { ?>
            <div id="area-neutra">
                <div id="area-apostas">
                    <p>
                        Meu dinheiro atual: <br>
                        <span id="label-dinheiro-atual">R$ 100.000,000</span>
                    </p>
                </div>
                <div class="baralho fundo-carta"></div>
                <div id="valor-partida">
                    Valor das apostas: <br>
                    <span id="total-apostas">R$ 000,00</span>
                </div>
            </div>
            <div id="area-banca">
                <p id="lbl-cartas-banca">Cartas da banca</p>
                <?php for ($i=1; $i < 7; $i++) { ?>
                    <div class="carta sem-carta" id="slot-banca<?php echo $i; ?>">
                        <span class="font-red valor"></span>
                        <div class="img-naipe"></div>
                    </div>
                <?php } ?>
            </div>
            <div id="minha-area">
                <div id="minhas-cartas">
                    <?php for ($i=6; $i > 0; $i--) { ?>
                        <div class="carta sem-carta" id="slot-jogador<?php echo $i; ?>">
                            <span class="valor"></span>
                            <div class="img-naipe"></div>
                        </div>
                    <?php } ?>
                    <p id="lbl-cartas-jogador">Minhas cartas</p>
                </div>
                <div id="area-opcoes" style="display: none;" class="opcoes-menu">
                    <div id="msg-opcoes">
                        <p>Selecione a ação desejada: </p>
                    </div>
                    <div class="bloco-opcoes">
                        <div id="bloco-btn-acao">
                            <button id="btn-opcao-stand">Permanecer</button>
                            <button id="btn-opcao-double">Dobrar</button>
                            <button id="btn-opcao-hit">Mais uma</button>
                            <button id="btn-opcao-surrender">Render-se</button>
                        </div>
                    </div>
                </div>
                <div id="area-resultado" style="display: none;" class="opcoes-menu">
                    <div id="msg-resultado">
                        <p>Selecione a ação desejada: </p>
                    </div>
                    <div class="bloco-opcoes">
                        <button id="btn-novo-jogo">Jogar Novamente</button>
                        <button id="btn-sobre">Sobre</button>
                    </div>
                </div>
                <div id="minhas-apostas" class="opcoes-menu">
                    <div id="msg-opcoes">
                        <p>Escolha entre a aposta mínima ou máxima, ou então, digite a aposta desejada:</p>
                    </div>
                    <div class="bloco-opcoes">
                        <div class="bloco-tipo-apostas">
                            <button id="btn-aposta-minima" class="btn-aposta">Aposta Mínima</button>
                            <button id="btn-aposta-maxima" class="btn-aposta">Aposta Máxima</button>
                        </div>
                        <div class="bloco-tipo-apostas">
                            Aposta personalizada: <br>
                            R$ <input type="text" id="txt-aposta" maxlength="3">,00
                            <button id="btn-finalizar-aposta">Apostar</button>
                        </div>

                    </div>
                </div>
            </div>
    <?php } ?>
    </div>
    <div id="menu-externo">
        <button id="quem-somos" title="Quem fez esta jeringonça?">Quem sou</button>
        <!--
            <button id="contato" title="Queremos saber a sua opinião! :D">Fale conosco</button>
        -->
    </div>
    <aside id="menu-ranking">
        <header>Jogadores mais ricos</header>
        <article>
            <table id="lista-ranking">
                <thead>
                    <tr>
                        <td width="40">Pos</td>
                        <td width="150">Nome</td>
                        <td width="110">$$$$</td>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </article>
        <?php if ($usuario_logado) { ?>
            <div id="div-outros-botoes">
                <button id="regras" title="Como se joga isso?">Regras</button>
                <button id="logoff" title="Quero sair da minha conta!">Logoff</button>
            </div>
        <?php } ?>
    </aside>

    <aside id="menu-quem-somos">
        <header>Quem sou</header>
        <article>
            <p>
                Alexandre Jorge Castanheira
            </p>
            
        </article>
    </aside>

    <aside id="menu-contato">
        <header>Fale conosco</header>
        <p>
            Nos conte o que achou do jogo, sugestões, críticas ou qualquer outra coisa, entre em contato!
        </p>
        <br>
        <p> <input type="text" name="nome" placeholder="Nome: " required autofocus> </p>
        <p> <input type="email" name="email" placeholder="E-mail: " required> </p>
        <p> <input type="text" name="assunto" placeholder="Assunto: " required> </p>
        <p> <textarea name="mensagem" id="mensagem" cols="30" rows="10" placeholder="Mensagem: " required></textarea> </p>
        <p> <input type="submit" id="submit-form-contato" value="Enviar"> </p>
    </aside>

<div id="dialog-message" title="Regras do Blackjack Fatec" style="display: none;">
    <p>
        <b>Objetivo do jogo:</b> O objetivo do jogo é marcar mais
        <span class="tip" title="Mais abaixo, é explicado como é feita a contagem de pontos.">pontos</span>
        que a <span class="tip" title="A banca, nada mais é, do que o computador. ;)">banca</span>,
        sem passar de <span class="tip" title="Por isso o jogo também é conhecido como '21'.">21 pontos</span>.
    </p>
    <p>
        <b>Mecânica do jogo: </b> O jogo é realizado em diversas etapas, que são:
        <ol>
            <li>
                <b>Início do jogo: </b> O jogo se inicia com o jogador e a banca com 2 cartas cada um.
                As cartas do jogador são viradas pra cima, enquanto uma carta da banca é virada pra baixo.
            </li>
            <li>
                <b>Apostas: </b> A primeira coisa que você deve fazer ao iniciar o jogo, é realizar a sua aposta; ela poderá ser qualquer valor entre R$5,00 e R$200,00.
                Após realizar a sua aposta, a banca irá automaticamente cobrir sua aposta, ou seja, quanto mais apostar, <span class="tip" title="O inverso também é válido. =X">mais você pode ganhar</span>.
            </li>
            <li>
               <b>Ações do jogador: </b>Nesta fase, você deverá escolher uma das ações que deseja realizar:
                <ul>
                    <li><b>Permanecer: </b> Você está satisfeito com as cartas que tem atualmente, e não deseja fazer nenhuma ação. </li>
                    <li><b>Dobrar: </b> Se você precisa de uma, e apenas uma carta, e tem certeza que ela irá fazer você ganhar o jogo, você irá dobrar sua aposta (e a banca também), e você comprará mais uma carta. Caso você passe dos 21 pontos ao comprar esta carta, você perde automaticamente. </li>
                    <li><b>Mais uma: </b> Solicita mais uma carta, esta ação pode ser feita mais de uma vez. Se ao comprar uma carta, você passar de 21 pontos, você perde automaticamente. </li>
                    <li><b>Render-se: </b> Caso você não goste das cartas iniciais que recebeu, você pode receber de volta metade da sua aposta, e desistir da partida. </li>
                </ul>
            </li>
            <li>
                <b>Jogada da banca: </b> Se o jogador ainda não estourou, é a vez da banca. Sua jogada é bem previsível, ela irá comprar cartas enquanto tiver
                <span class="tip" title="Nos casinos reais, as bancas são orientadas a seguir estas mesmas ordens.">15 pontos ou menos</span>.
                Se ao comprar cartas a banca estourar de alguma forma, o jogador ganha automaticamente.
            </li>
            <li>
                <b>Contagem de pontos: </b> Se nem o jogador ou a banca estourarem, é feita a contagem de pontos de cada um dos dois. Quem tiver mais pontos é o vencedor. Caso haja um empate, as apostas são devolvidas.
            </li>
        </ol>
    </p>
    <p>
        <b>Pontuação: </b><br>
        <ul>
            <li>A (ás): <b>1</b> ou <b>11</b>.</li>
            <li>2, 3, 4, 5, 6, 7, 8, 9 e 10: o respectivo valor que está marcado na carta.</li>
            <li>J, Q e K: valem <b>10</b>.</li>
        </ul>
    </p>
    <br>
    <p>Agora que você já sabe como jogar, boa sorte! =D</p>
</div>

<style>

.ui-widget-header {
    background-color: inherit !important;
    background-image: linear-gradient(to bottom, #008000, #006400) !important;
    color: #FFFFFF !important;
}

.ui-dialog-buttonset button {
    width: inherit !important;
}

.tip {
    text-decoration: underline;
    cursor: pointer;
}

#menu-quem-somos p {
    color: #FFFFFF;
    font-weight: bold;
    padding: 10px;
    text-align: center;
}

#menu-quem-somos, #menu-contato {
    display: none;
}

#menu-contato > p {
    text-align: center;
    font-size: 12px;
    color: #FFFFFF;
}

#menu-contato input, #menu-contato textarea {
    color: #000000 !important;
    width: 90% !important;
}

#menu-externo {
    margin-bottom: 15px;
    float: right;
    margin-top: 50px;
    overflow: hidden;
    width: 270px;
}

#quem-somos, #contato {
    font-weight: bold;
    width: 125px;
}

#contato {
    float: right;
    margin-right: -5px;
}

#quem-somos {
    float: left;
}

</style>

</body>
</html>