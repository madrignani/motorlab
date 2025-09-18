<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Cliente extends Model {
    
    protected $table = 'cliente';
    protected $fillable = [
        'cpf',
        'nome',
        'telefone',
        'email',
    ];
    
    public $timestamps = false;

    public function veiculos() { return $this->hasMany(Veiculo::class, 'cliente_id'); }

}


?>