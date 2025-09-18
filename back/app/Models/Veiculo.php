<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Veiculo extends Model {
    
    protected $table = 'veiculo';
    protected $fillable = [
        'cliente_id',
        'placa',
        'chassi',
        'marca',
        'modelo',
        'ano',
        'quilometragem',
    ];

    public $timestamps = false;
  
    public function cliente() { return $this->belongsTo(Cliente::class, 'cliente_id'); }

}


?>