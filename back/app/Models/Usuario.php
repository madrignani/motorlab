<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Usuario extends Model {

    protected $table = 'usuario';
    protected $fillable = [
        'cpf',
        'nome',
        'password',
        'cargo',
        'ativo',
    ];
    protected $hidden = [
        'password',
    ];
    protected $casts = [
        'ativo' => 'boolean',
    ];
    
    public $timestamps = false;

}


?>