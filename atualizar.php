<?php
$username = 'u160480561_user';
$password = 'zWQ0UjXYeE';
$host = 'mysql.hostinger.com.br';
$database = 'u160480561_black';

$retorno = array();

if (!session_id()) session_start();
$email = $_SESSION['email'];

$conn = mysql_connect($host, $username, $password);

if ($conn)
{
    mysql_select_db($database);
    $senha = md5($senha);
    $result = mysql_query("SELECT * FROM usuarios WHERE email = '{$email}' LIMIT 1");
    $retorno['usuario'] = mysql_fetch_assoc($result);

    $result2 = mysql_query("
        SELECT nome, dinheiro_atual, qt_vitorias, qt_empates, qt_derrotas, maior_valor_obtido, menor_valor_obtido
        FROM usuarios ORDER BY dinheiro_atual DESC LIMIT 50
    ");

    $retorno['mais_ricos'] = array();
    while ($row = mysql_fetch_array($result2, MYSQL_NUM)) {
        $retorno['mais_ricos'][] = $row;
        $cont++;
    }
}
else
{
    $msg_erro .= 'Não foi possível conectar-se ao banco de dados.';
}

mysql_close($conn);

header('Content-type: application/json');
echo json_encode($retorno);
