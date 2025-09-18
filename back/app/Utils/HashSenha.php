<?php


namespace App\Utils;
use Illuminate\Support\Facades\Hash;


class HashSenha {
    
    public static function gerarHash(string $senha): string {
        return Hash::make($senha);
    }

}


?>