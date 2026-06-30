<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ConvocationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $date;
    public $time;
    public $anneeScolaire;

    public function __construct($student, $date, $time)
    {
        $this->student = $student;
        $this->date = $date;
        $this->time = $time;
        $this->anneeScolaire = date('Y') . '-' . (date('Y') + 1);
    }

    public function build()
    {
        return $this->subject('Convocation Officielle — Lycée Charif Idrissi')
                    ->view('emails.convocation_email')  
                    ->with([
                        'name' => $this->student->full_name,
                        'date' => \Carbon\Carbon::parse($this->date)->locale('fr')->isoFormat('dddd D MMMM YYYY'),
                        'time' => $this->time,
                        'annee_scolaire' => $this->anneeScolaire,
                        'lieu' => 'Lycée Charif Idrissi — Bureau des Admissions, Tétouan',
                    ]);
    }
}