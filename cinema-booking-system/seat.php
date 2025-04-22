<?php
// seat.php

class Seat {
    public $seat_id;
    public $row;
    public $column;
    public $is_available;
    
    public function __construct($seat_id, $row, $column, $is_available) {
        $this->seat_id = $seat_id;
        $this->row = $row;
        $this->column = $column;
        $this->is_available = $is_available;
    }
}