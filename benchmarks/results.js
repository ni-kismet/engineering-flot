[{
    type: "Chrome Performance Profiler",
    GPU: "AMD Radeon R9 380",
    CPU: "Intel Pentium G3258 - 4.2GHz - 2 Cores",
    benchmarks: 
    [
        {
            pointsNo: 300,
            master_drawDuration: "6.9 ms",
            threejs_drawDuration: "0.4 ms",
        },
        {
            pointsNo: 10000,
            drawDuration: "91 ms",
            threejs_drawDuration: "12 ms",
        },
        {
            pointsNo: 100000,
            drawDuration: "1226 ms",
            threejs_drawDuration: "59 ms",
        }     
    ]
},
{
    type: "Chrome Performance Profiler",
    GPU: "Intel HD Graphics 4000",
    CPU: "Intel Core i7-3770 - 3.7 GHz - 8 Cores",
    benchmarks: 
    [
        {
            pointsNo: 300,
            master_drawDuration: "3.6 ms",
            threejs_drawDuration: "1.6 ms",
        },
        {
            pointsNo: 10000,
            master_drawDuration: "98.5 ms",
            threejs_drawDuration: "16.5 ms",
        },
        {
            pointsNo: 100000,
            master_drawDuration: "1359 ms",
            threejs_drawDuration: "63 ms",
        }     
    ]
}]