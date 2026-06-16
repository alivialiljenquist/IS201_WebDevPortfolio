<?php
/**
 * Portfolio contact form handler.
 * Expects an AJAX POST from assets/vendor/php-email-form/validate.js
 * and returns "OK" on success.
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo 'Method not allowed.';
  exit;
}

if (
  empty($_SERVER['HTTP_X_REQUESTED_WITH']) ||
  strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest'
) {
  http_response_code(400);
  echo 'Invalid request.';
  exit;
}

$receiving_email_address = 'alivialiljenquist@gmail.com';

$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if ($name === '' || $email === '' || $subject === '' || $message === '') {
  echo 'Please fill in all required fields.';
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo 'Please enter a valid email address.';
  exit;
}

if (strlen($message) < 10) {
  echo 'Message must be at least 10 characters.';
  exit;
}

$safe_name = str_replace(["\r", "\n"], '', $name);
$safe_subject = str_replace(["\r", "\n"], '', $subject);
$mail_subject = '[Portfolio Contact] ' . $safe_subject;

$mail_body = "New message from your portfolio contact form.\n\n";
$mail_body .= "Name: {$safe_name}\n";
$mail_body .= "Email: {$email}\n\n";
$mail_body .= "Message:\n{$message}\n";

$host = isset($_SERVER['HTTP_HOST']) ? preg_replace('/[^a-zA-Z0-9.\-]/', '', $_SERVER['HTTP_HOST']) : 'localhost';
$from_address = 'noreply@' . $host;

$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'From: Portfolio Contact <' . $from_address . '>',
  'Reply-To: ' . $safe_name . ' <' . $email . '>',
  'X-Mailer: PHP/' . phpversion(),
];

$sent = @mail(
  $receiving_email_address,
  $mail_subject,
  $mail_body,
  implode("\r\n", $headers)
);

if ($sent) {
  echo 'OK';
  exit;
}

echo 'Sorry, your message could not be sent. Please email ' . $receiving_email_address . ' directly.';
exit;
