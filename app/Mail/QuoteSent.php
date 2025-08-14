<?php

namespace App\Mail;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteSent extends Mailable
{
    use Queueable, SerializesModels;

    public $quote;
    private $pdfContent;

    /**
     * Create a new message instance.
     */
    public function __construct(Quote $quote, $pdfContent = null)
    {
        $this->quote = $quote;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Cotización #{$this->quote->quote_number} - " . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.quote-sent',
            with: [
                'quote' => $this->quote,
                'customer' => $this->quote->customer,
                'company' => config('app.name'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        if ($this->pdfContent) {
            $attachments[] = Attachment::fromData(
                fn() => $this->pdfContent->output(),
                "cotizacion-{$this->quote->quote_number}.pdf"
            )->withMime('application/pdf');
        }

        return $attachments;
    }
}
