<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{

    // PUBLIC - LIST REGION
    public function index()
    {
        return response()->json(
            Region::all()
        );
    }


    // PUBLIC - DETAIL REGION
    public function show(Region $region)
    {
        return response()->json(
            $region
        );
    }

}