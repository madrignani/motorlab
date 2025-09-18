<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class Laudo extends Model {
    
    protected $table = 'laudo';
    protected $fillable = [
        'os_id',
        'resumo',
        'recomendacoes',
    ];
    
    public $timestamps = false;
  
    public function os() { return $this->belongsTo(Os::class, 'os_id'); }

}


?>