<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log for debugging
        Log::info('AdminMiddleware running', [
            'user' => $request->user() ? $request->user()->id : 'not authenticated',
            'path' => $request->path()
        ]);

        // Check if user is authenticated and has admin role using Spatie Permission
        if (!$request->user() || !$request->user()->hasRole('root')) {
            Log::warning('Access denied: User does not have admin role', [
                'user' => $request->user() ? $request->user()->id : 'not authenticated'
            ]);
            abort(403, 'Unauthorized action. Admin access required.');
        }

        return $next($request);
    }
}
