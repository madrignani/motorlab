<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Os extends Model {

    protected $table = 'os';
    protected $fillable = [
        'cliente_id',
        'veiculo_id',
        'usuario_criacao',
        'usuario_responsavel',
        'status',
        'data_hora_criacao',
        'valor_estimado',
        'valor_final',
        'observacoes',
    ];
    protected $casts = [
        'data_hora_criacao' => 'datetime',
        'valor_estimado' => 'decimal:2',
        'valor_final' => 'decimal:2',
    ];

    public $timestamps = false;

    public function cliente() { return $this->belongsTo(Cliente::class, 'cliente_id'); }
    public function veiculo() { return $this->belongsTo(Veiculo::class, 'veiculo_id'); }
    public function criador() { return $this->belongsTo(Usuario::class, 'usuario_criacao'); }
    public function responsavel() { return $this->belongsTo(Usuario::class, 'usuario_responsavel'); }
    public function custos() { return $this->hasMany(OsCusto::class, 'os_id'); }
    public function laudo() { return $this->hasOne(Laudo::class, 'os_id'); }

}


?>