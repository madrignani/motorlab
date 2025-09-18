<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Item extends Model {

    protected $table = 'item';
    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'preco_venda',
        'estoque',
        'estoque_minimo',
        'localizacao',
    ];
    protected $casts = [
        'preco_venda' => 'decimal:2',
        'estoque' => 'integer',
        'estoque_minimo' => 'integer',
    ];

    public $timestamps = false;

}


?>