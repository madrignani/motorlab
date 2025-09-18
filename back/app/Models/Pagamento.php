<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Pagamento extends Model {

    protected $table = 'pagamento';
    protected $fillable = [
        'os_id',
        'usuario_responsavel',
        'data_hora',
        'valor',
        'metodo',
    ];
    protected $casts = [
        'data_hora' => 'datetime',
        'valor' => 'decimal:2',
    ];

    public $timestamps = false;

    public function os() { return $this->belongsTo(Os::class, 'os_id'); }
    public function usuario() { return $this->belongsTo(Usuario::class, 'usuario_responsavel'); }

}


?>