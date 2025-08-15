<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JsonMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Set header untuk memastikan response dalam format JSON
        $request->headers->set('Accept', 'application/json');
        
        // Jika request method adalah POST/PUT/PATCH, pastikan content-type adalah JSON
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $request->headers->set('Content-Type', 'application/json');
        }
        
        $response = $next($request);
        
        // Pastikan response juga dalam format JSON
        $response->headers->set('Content-Type', 'application/json');
        
        return $response;
    }
}
