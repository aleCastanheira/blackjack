<?php

if ($_POST['dinheiro_atual'] != '')
{
    $dinheiro_atual = $_POST['dinheiro_atual'];
    $tipo_partida = $_POST['tipo'];

    $field = 'qt_derrotas';
    switch ($tipo_partida)
    {
        case 1:
            //vitória
            $field = 'qt_vitorias';
            break;

        case 2:
            //empate
            $field = 'qt_empates';
            break;

        default:
            //derrota
            $field = 'qt_derrotas';
            break;
    }

    $username = 'root';
    $password = 'root';
    $host = 'localhost';
    $database = 'blackjackfatec';

    if (!session_id()) session_start();
    $email = $_SESSION['email'];
    if (empty($email)) return FALSE;

    $conn = mysql_connect($host, $username, $password);
    mysql_select_db($database);

    $trecho_sql = '';

    $retorno = (!$conn) ? FALSE : TRUE;
    if ($retorno)
    {
        $result_usuario = mysql_query("SELECT * FROM usuarios WHERE email = '{$email}' LIMIT 1");
        $usuario = mysql_fetch_assoc($result_usuario);

        $field_valor = '';
        if ($dinheiro_atual > $usuario['maior_valor_obtido'])
        {
            $field_valor = 'maior_valor_obtido';
        }
        else
        {
            if ($dinheiro_atual < $usuario['menor_valor_obtido'])
            {
                $field_valor = 'menor_valor_obtido';
            }
        }

        if (!empty($field_valor))
            $trecho_sql = ", {$field_valor} = {$dinheiro_atual}";
    }

    if ($retorno)
    {
        $sql = "
            UPDATE usuarios
            SET dinheiro_atual = {$dinheiro_atual}, {$field} = {$field} + 1 {$trecho_sql}
            WHERE email = '{$email}'
            LIMIT 1
        ";

        $result = mysql_query($sql, $conn);

        $retorno = ($result) ? TRUE : FALSE;
    }

    mysql_close($conn);
    return $retorno;
}

