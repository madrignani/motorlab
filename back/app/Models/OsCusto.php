<?php


namespace App\Models;
use Illuminate\Database\Eloquent\Model;


class OsCusto extends Model {
    
    protected $table = 'os_custo';
    protected $fillable = [
        'os_id',
        'item_id',
        'tipo',
        'descricao',
        'quantidade',
        'subtotal',
    ];
    protected $casts = [
        'quantidade' => 'integer',
        'subtotal' => 'decimal:2',
    ];

    public $timestamps = false;
    
    public function os() { return $this->belongsTo(Os::class, 'os_id'); }
    public function item() { return $this->belongsTo(Item::class, 'item_id'); }

}


?>