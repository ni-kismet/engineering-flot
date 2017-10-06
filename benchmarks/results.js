[{
    type: "PROFILER",
    GPU: "AMD Radeon 380",
    master: 
    {
        benchmarks: 
        [
            {
                pointsNo: 300,
                draw: 
                {
                    duration: "6.9ms",
                    drawSeries: 
                    {
                        duration: "6.7 ms"
                    },
                    Renderer: 
                    {
                        type: Canvas,
                        duration: "0.1ms"
                    }
                } 
            },
            {
                pointsNo: 10000,
                draw: 
                {
                    duration: "91 ms",
                    drawSeries: 
                    {
                        duration: "88 ms",
                    },
                    Renderer: 
                    {
                        type: Canvas,
                        duration: "0.1 ms"
                    }
                }
            },
            {
                pointsNo: 100000,
                draw: 
                {
                    duration: "1226 ms",
                    drawSeries: 
                    {
                        duration: "1224 ms",
                    },
                    Renderer: 
                    {
                        type: Canvas,
                        duration: "0.1 ms"
                    }
                }
            }     
        ]
    },
    webgl_prototyping: 
    {
        benchmarks: 
        [
            {
                pointsNo: 300,
                draw: 
                {
                    duration: "0.4 ms",
                    drawSeries: 
                    {
                        duration: "0.1 ms"
                    },
                    Renderer: 
                    {
                        type: WebGlCanvas,
                        duration: "0.1ms"
                    }
                } 
            },
            {
                pointsNo: 10000,
                draw: 
                {
                    duration: "12 ms",
                    drawSeries: 
                    {
                        duration: "0.5 ms",
                    },
                    Renderer: 
                    {
                        type: WebGlCanvas,
                        duration: "0.4 ms"
                    }
                }
            },
            {
                pointsNo: 100000,
                draw: 
                {
                    duration: "59 ms",
                    drawSeries: 
                    {
                        duration: "58 md",
                    },
                    Renderer: 
                    {
                        type: WebGlCanvas,
                        duration: "7.5 ms"
                    }
                }
            }     
        ]
    }
},
{
    type: JS_PROFILER,
    master: 
    {
        benchmarks: 
        [
            {
                pointsNo: 300,
                draw: 
                {
                    duration: "2595 ms",
                    drawSeries: 
                    {
                        duration: "2424 ms"
                    },
                    Renderer: 
                    {
                        type: Canvas,
                        duration: "32 ms"
                    }
                } 
            },
            {
                pointsNo: 10000,
                draw: 
                {
                    duration: "10965 ms",
                    drawSeries: 
                    {
                        duration: "10927 ms",
                    },
                    Renderer: 
                    {
                        type: Canvas,
                        duration: "1.8 ms"
                    }
                }
            },
            {
                pointsNo: 100000,
                draw: 
                {
                    duration: "13986 ms",
                    drawSeries: 
                    {
                        duration: "13974 ms",
                    },
                    Renderer: 
                    {
                        type: Canvas,
                        duration: "0.1 ms"
                    }
                }
            }     
        ]
    },
    webgl_prototyping: 
    {
        benchmarks: 
        [
            {
                pointsNo: 300,
                draw: 
                {
                    duration: "425 ms",
                    drawSeries: 
                    {
                        duration: "64 ms"
                    },
                    Renderer: 
                    {
                        type: WebGlCanvas,
                        duration: "188 ms"
                    }
                } 
            },
            {
                pointsNo: 10000,
                draw: 
                {
                    duration: "1518 ms",
                    drawSeries: 
                    {
                        duration: "706 ms",
                    },
                    Renderer: 
                    {
                        type: WebGlCanvas,
                        duration: "779 ms"
                    }
                }
            },
            {
                pointsNo: 100000,
                draw: 
                {
                    duration: "3225 ms",
                    drawSeries: 
                    {
                        duration: "1395 ms",
                    },
                    Renderer: 
                    {
                        type: WebGlCanvas,
                        duration: "1788 ms"
                    }
                }
            }     
        ]
    }

}]