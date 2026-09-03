var TPL_B787 = {
  name:"Boeing 787-900", refStation:"1199.2",
  ulds:[
    {id:"u1",uldType:"LD3",    iata:"AKE",maxWeight:1587,tare:63},
    {id:"u2",uldType:"LD3",    iata:"PKC",maxWeight:1587,tare:37},
    {id:"u3",uldType:"LD7/P88",iata:"PAG",maxWeight:4626,tare:85},
    {id:"u4",uldType:"LD7/P96",iata:"PMC",maxWeight:5102,tare:91},
    {id:"u5",uldType:"LD8",    iata:"PLA",maxWeight:3174,tare:90},
  ],
  compartments:[
  {id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"11L",fwd:"340.95",aft:"401.5",left:"0",  right:"108",index:"-0.00414",maxWeight:"1587"},
      {name:"11R",fwd:"340.95",aft:"401.5",left:"108",right:"0",  index:"-0.00414",maxWeight:"1587"},
      {name:"12L",fwd:"402.35",aft:"462.9",left:"0",  right:"108",index:"-0.00383",maxWeight:"1587"},
      {name:"12R",fwd:"402.35",aft:"462.9",left:"108",right:"0",  index:"-0.00383",maxWeight:"1587"},
      {name:"13L",fwd:"463.65",aft:"524.2",left:"0",  right:"108",index:"-0.00353",maxWeight:"1587"},
      {name:"13R",fwd:"463.65",aft:"524.2",left:"108",right:"0",  index:"-0.00353",maxWeight:"1587"},
      {name:"14L",fwd:"525.05",aft:"585.6",left:"0",  right:"108",index:"-0.00322",maxWeight:"1587"},
      {name:"14R",fwd:"525.05",aft:"585.6",left:"108",right:"0",  index:"-0.00322",maxWeight:"1587"},
      {name:"15L",fwd:"586.35",aft:"646.9",left:"0",  right:"108",index:"-0.00291",maxWeight:"1587"},
      {name:"15R",fwd:"586.35",aft:"646.9",left:"108",right:"0",  index:"-0.00291",maxWeight:"1587"},
    ]},
    {id:"g2",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"11P",fwd:"341",  aft:"437",  left:"0",right:"0",index:"-0.00407",maxWeight:"4626"},
      {name:"12P",fwd:"441",  aft:"537.1",left:"0",right:"0",index:"-0.00357",maxWeight:"4626"},
      {name:"13P",fwd:"568.6",aft:"664.6",left:"0",right:"0",index:"-0.00289",maxWeight:"4626"},
    ]},
    {id:"g3",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"11P",fwd:"341",  aft:"437",  left:"0",right:"0",index:"-0.00405",maxWeight:"5102"},
      {name:"12P",fwd:"441",  aft:"537.1",left:"0",right:"0",index:"-0.00355",maxWeight:"5102"},
      {name:"13P",fwd:"568.6",aft:"664.5",left:"0",right:"0",index:"-0.00291",maxWeight:"5102"},
    ]},
    {id:"g4",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
      {name:"11",fwd:"340.95",aft:"401.5", left:"0",right:"0",index:"-0.00414",maxWeight:"3174"},
      {name:"12",fwd:"402.35",aft:"462.6", left:"0",right:"0",index:"-0.00383",maxWeight:"3174"},
      {name:"13",fwd:"463.65",aft:"524.2", left:"0",right:"0",index:"-0.00352",maxWeight:"3174"},
      {name:"14",fwd:"525.05",aft:"586.35",left:"0",right:"0",index:"-0.00322",maxWeight:"3174"},
      {name:"15",fwd:"586.35",aft:"646.9", left:"0",right:"0",index:"-0.00291",maxWeight:"3174"},
    ]}
  ]},
  {id:"c2",number:2,uldGroups:[
    {id:"g5",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"21L",fwd:"647.75",aft:"709.05",left:"0",  right:"108",index:"-0.00261",maxWeight:"1587"},
      {name:"21R",fwd:"647.75",aft:"709.05",left:"108",right:"0",  index:"-0.00261",maxWeight:"1587"},
      {name:"22L",fwd:"709.05",aft:"769.6", left:"0",  right:"108",index:"-0.0023", maxWeight:"1587"},
      {name:"22R",fwd:"709.05",aft:"769.6", left:"108",right:"0",  index:"-0.0023", maxWeight:"1587"},
      {name:"23L",fwd:"770.45",aft:"831",   left:"0",  right:"108",index:"-0.00199",maxWeight:"1587"},
      {name:"23R",fwd:"770.45",aft:"831",   left:"108",right:"0",  index:"-0.00199",maxWeight:"1587"},
      {name:"24L",fwd:"832.6", aft:"893.3", left:"0",  right:"108",index:"-0.00168",maxWeight:"1587"},
      {name:"24R",fwd:"832.6", aft:"893.3", left:"108",right:"0",  index:"-0.00168",maxWeight:"1587"},
      {name:"25L",fwd:"894.95",aft:"955.45",left:"0",  right:"108",index:"-0.00137",maxWeight:"1587"},
      {name:"25R",fwd:"894.95",aft:"955.45",left:"108",right:"0",  index:"-0.00137",maxWeight:"1587"},
    ]},
    {id:"g6",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"21P",fwd:"673.4",aft:"761.6",left:"0",right:"0",index:"-0.00241",maxWeight:"4626"},
      {name:"22P",fwd:"770.4",aft:"858.6",left:"0",right:"0",index:"-0.00192",maxWeight:"4626"},
      {name:"23P",fwd:"867.3",aft:"955.4",left:"0",right:"0",index:"-0.00144",maxWeight:"5102"},
    ]},
    {id:"g7",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"21P",fwd:"665.5",aft:"761.6",left:"0",right:"0",index:"-0.00242",maxWeight:"5102"},
      {name:"22P",fwd:"762.5",aft:"858.6",left:"0",right:"0",index:"-0.00194",maxWeight:"5102"},
      {name:"23P",fwd:"859.4",aft:"955.4",left:"0",right:"0",index:"-0.00145",maxWeight:"5669"},
    ]},
    {id:"g8",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
      {name:"21",fwd:"647.75",aft:"708.3", left:"0",right:"0",index:"-0.0026", maxWeight:"3174"},
      {name:"22",fwd:"709.05",aft:"770.45",left:"0",right:"0",index:"-0.0023", maxWeight:"3174"},
      {name:"23",fwd:"770.45",aft:"831",   left:"0",right:"0",index:"-0.00199",maxWeight:"3174"},
      {name:"24",fwd:"832.6", aft:"893.3", left:"0",right:"0",index:"-0.00168",maxWeight:"3174"},
      {name:"25",fwd:"894.95",aft:"955.45",left:"0",right:"0",index:"-0.00137",maxWeight:"3174"},
    ]}
  ]},
  {id:"c3",number:3,uldGroups:[
    {id:"g9",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"31L",fwd:"1417.2",aft:"1477.8",left:"0",  right:"108",index:"0.00124",maxWeight:"1587"},
      {name:"31R",fwd:"1417.2",aft:"1477.8",left:"108",right:"0",  index:"0.00124",maxWeight:"1587"},
      {name:"32L",fwd:"1479.4",aft:"1540.1",left:"0",  right:"108",index:"0.00155",maxWeight:"1587"},
      {name:"32R",fwd:"1479.4",aft:"1540.1",left:"108",right:"0",  index:"0.00155",maxWeight:"1587"},
      {name:"33L",fwd:"1541.7",aft:"1602.3",left:"0",  right:"108",index:"0.00186",maxWeight:"1587"},
      {name:"33R",fwd:"1541.7",aft:"1602.3",left:"108",right:"0",  index:"0.00186",maxWeight:"1587"},
      {name:"34L",fwd:"1603.1",aft:"1663.7",left:"0",  right:"108",index:"0.00217",maxWeight:"1587"},
      {name:"34R",fwd:"1603.2",aft:"1663.7",left:"108",right:"0",  index:"0.00217",maxWeight:"1587"},
    ]},
    {id:"g10",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"31P",fwd:"1417.3",aft:"1505.4",left:"0",right:"0",index:"0.00133",maxWeight:"5102"},
      {name:"32P",fwd:"1514.2",aft:"1602.3",left:"0",right:"0",index:"0.00179",maxWeight:"4626"},
      {name:"33P",fwd:"1611.2",aft:"1699.3",left:"0",right:"0",index:"0.00228",maxWeight:"4626"},
    ]},
    {id:"g11",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"31P",fwd:"1417.3",aft:"1513.4",left:"0",right:"0",index:"0.00133",maxWeight:"5669"},
      {name:"32P",fwd:"1514.2",aft:"1610.3",left:"0",right:"0",index:"0.00182",maxWeight:"5102"},
      {name:"33P",fwd:"1611.2",aft:"1707.3",left:"0",right:"0",index:"0.0023", maxWeight:"5102"},
    ]},
    {id:"g12",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
      {name:"31",fwd:"1417.3",aft:"1477.8",left:"0",right:"0",index:"0.00124",maxWeight:"3174"},
      {name:"32",fwd:"1479.6",aft:"1540.1",left:"0",right:"0",index:"0.00155",maxWeight:"3174"},
      {name:"33",fwd:"1541.8",aft:"1602.3",left:"0",right:"0",index:"0.00186",maxWeight:"3174"},
      {name:"34",fwd:"1603.2",aft:"1663.7",left:"0",right:"0",index:"0.00217",maxWeight:"3174"},
    ]}
  ]},
  {id:"c4",number:4,uldGroups:[
    {id:"g13",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"41L",fwd:"1664.4",aft:"1725",  left:"0",  right:"108",index:"0.00248",maxWeight:"1587"},
      {name:"41R",fwd:"1664.4",aft:"1725",  left:"108",right:"0",  index:"0.00248",maxWeight:"1587"},
      {name:"42L",fwd:"1725.8",aft:"1786.4",left:"0",  right:"108",index:"0.00278",maxWeight:"1587"},
      {name:"42R",fwd:"1725.8",aft:"1786.4",left:"108",right:"0",  index:"0.00278",maxWeight:"1587"},
      {name:"43L",fwd:"1787.1",aft:"1847.7",left:"0",  right:"108",index:"0.00309",maxWeight:"1587"},
      {name:"43R",fwd:"1787.2",aft:"1847.7",left:"108",right:"0",  index:"0.00309",maxWeight:"1587"},
      {name:"44L",fwd:"1848.5",aft:"1909.1",left:"0",  right:"108",index:"0.0034", maxWeight:"1587"},
      {name:"44R",fwd:"1848.5",aft:"1909.1",left:"108",right:"0",  index:"0.0034", maxWeight:"1587"},
    ]},
    {id:"g14",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"41P",fwd:"1720.8",aft:"1809", left:"0",right:"0",index:"0.00282",maxWeight:"4626"},
      {name:"42P",fwd:"1820.9",aft:"1909.1",left:"0",right:"0",index:"0.00332",maxWeight:"4626"},
    ]},
    {id:"g15",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"41P",fwd:"1712.8",aft:"1809", left:"0",right:"0",index:"0.00281",maxWeight:"5102"},
      {name:"42P",fwd:"1812.9",aft:"1909.1",left:"0",right:"0",index:"0.00331",maxWeight:"5102"},
    ]},
    {id:"g16",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
      {name:"41",fwd:"1664.4",aft:"1725",  left:"0",right:"0",index:"0.00248",maxWeight:"3174"},
      {name:"42",fwd:"1725.9",aft:"1787.2",left:"0",right:"0",index:"0.00278",maxWeight:"3174"},
      {name:"43",fwd:"1787.1",aft:"1847.7",left:"0",right:"0",index:"0.00309",maxWeight:"3174"},
      {name:"44",fwd:"1848.5",aft:"1909.1",left:"0",right:"0",index:"0.0034", maxWeight:"3174"},
    ]}
  ]}
  ]
};


var TPL_A330 = {
  name:"Airbus A330-300", refStation:"36.35",
  ulds:[
    {id:"u1",uldType:"LD3",    iata:"AKE",maxWeight:1587,tare:63},
    {id:"u2",uldType:"LD3",    iata:"PKC",maxWeight:1587,tare:37},
    {id:"u3",uldType:"LD7/P88",iata:"PAG",maxWeight:4626,tare:85},
    {id:"u4",uldType:"LD7/P96",iata:"PMC",maxWeight:5103,tare:91},
    {id:"u5",uldType:"LD8",    iata:"PLA",maxWeight:3174,tare:90},
  ],
  compartments:[
    {id:"c1",number:1,uldGroups:[
      {id:"g1",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
        {name:"11L",fwd:"14.662",aft:"16.202",left:"0",  right:"2.82",index:"-0.00837",maxWeight:"1587"},
        {name:"11R",fwd:"14.662",aft:"16.202",left:"2.82",right:"0", index:"-0.00837",maxWeight:"1587"},
        {name:"12L",fwd:"16.448",aft:"17.988",left:"0",  right:"2.82",index:"-0.00765",maxWeight:"1587"},
        {name:"12R",fwd:"16.448",aft:"17.988",left:"2.82",right:"0", index:"-0.00765",maxWeight:"1587"},
        {name:"13L",fwd:"18.03", aft:"19.571",left:"0",  right:"2.82",index:"-0.00702",maxWeight:"1587"},
        {name:"13R",fwd:"18.03", aft:"19.571",left:"2.82",right:"0", index:"-0.00702",maxWeight:"1587"},
      ]},
      {id:"g2",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
        {name:"11P",fwd:"14.662",aft:"16.904",left:"0",right:"0",index:"-0.00823",maxWeight:"4626"},
        {name:"12P",fwd:"17.329",aft:"19.571",left:"0",right:"0",index:"-0.00716",maxWeight:"4626"},
      ]},
      {id:"g3",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
        {name:"11P",fwd:"14.662",aft:"17.107",left:"0",right:"0",index:"-0.00819",maxWeight:"5103"},
        {name:"12P",fwd:"17.126",aft:"19.571",left:"0",right:"0",index:"-0.0072", maxWeight:"5103"},
      ]},
      {id:"g4",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
        {name:"11",fwd:"14.662",aft:"16.202",left:"0",right:"0",index:"-0.00837",maxWeight:"3174"},
        {name:"12",fwd:"16.448",aft:"17.988",left:"0",right:"0",index:"-0.00765",maxWeight:"3174"},
        {name:"13",fwd:"18.03", aft:"19.571",left:"0",right:"0",index:"-0.00702",maxWeight:"3174"},
      ]},
    ]},
    {id:"c2",number:2,uldGroups:[
      {id:"g5",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
        {name:"21L",fwd:"19.793",aft:"21.333",left:"0",   right:"2.82",index:"-0.00631",maxWeight:"1587"},
        {name:"21R",fwd:"19.793",aft:"21.333",left:"2.82",right:"0",   index:"-0.00631",maxWeight:"1587"},
        {name:"22L",fwd:"21.375",aft:"22.916",left:"0",   right:"2.82",index:"-0.00568",maxWeight:"1587"},
        {name:"22R",fwd:"21.375",aft:"22.916",left:"2.82",right:"0",   index:"-0.00568",maxWeight:"1587"},
        {name:"23L",fwd:"22.958",aft:"24.498",left:"0",   right:"2.82",index:"-0.00505",maxWeight:"1587"},
        {name:"23R",fwd:"22.958",aft:"24.498",left:"2.82",right:"0",   index:"-0.00505",maxWeight:"1587"},
        {name:"24L",fwd:"24.721",aft:"26.261",left:"0",   right:"2.82",index:"-0.00434",maxWeight:"1587"},
        {name:"24R",fwd:"24.721",aft:"26.261",left:"2.82",right:"0",   index:"-0.00434",maxWeight:"1587"},
        {name:"25L",fwd:"26.303",aft:"27.843",left:"0",   right:"2.82",index:"-0.00371",maxWeight:"1587"},
        {name:"25R",fwd:"26.303",aft:"27.843",left:"2.82",right:"0",   index:"-0.00371",maxWeight:"1587"},
        {name:"26L",fwd:"27.885",aft:"29.425",left:"0",   right:"2.82",index:"-0.00308",maxWeight:"1587"},
        {name:"26R",fwd:"27.885",aft:"29.425",left:"2.82",right:"0",   index:"-0.00308",maxWeight:"1587"},
      ]},
      {id:"g6",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
        {name:"21P",fwd:"19.793",aft:"22.034",left:"0",right:"0",index:"-0.00617",maxWeight:"4626"},
        {name:"22P",fwd:"22.256",aft:"24.498",left:"0",right:"0",index:"-0.00519",maxWeight:"4626"},
        {name:"23P",fwd:"24.72", aft:"26.962",left:"0",right:"0",index:"-0.0042", maxWeight:"4626"},
        {name:"24P",fwd:"27.184",aft:"29.426",left:"0",right:"0",index:"-0.00322",maxWeight:"4626"},
      ]},
      {id:"g7",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
        {name:"21P",fwd:"19.59", aft:"22.034",left:"0",right:"0",index:"-0.00622",maxWeight:"5103"},
        {name:"22P",fwd:"22.053",aft:"24.498",left:"0",right:"0",index:"-0.00523",maxWeight:"5103"},
        {name:"23P",fwd:"24.517",aft:"26.962",left:"0",right:"0",index:"-0.00424",maxWeight:"5103"},
        {name:"24P",fwd:"26.98", aft:"29.426",left:"0",right:"0",index:"-0.00326",maxWeight:"5103"},
      ]},
      {id:"g8",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
        {name:"21",fwd:"19.793",aft:"21.333",left:"0",right:"0",index:"-0.00631",maxWeight:"3174"},
        {name:"22",fwd:"21.375",aft:"22.916",left:"0",right:"0",index:"-0.00568",maxWeight:"3174"},
        {name:"23",fwd:"22.958",aft:"24.498",left:"0",right:"0",index:"-0.00505",maxWeight:"3174"},
        {name:"24",fwd:"24.721",aft:"26.261",left:"0",right:"0",index:"-0.00434",maxWeight:"3174"},
        {name:"25",fwd:"26.303",aft:"27.843",left:"0",right:"0",index:"-0.00371",maxWeight:"3174"},
        {name:"26",fwd:"27.885",aft:"29.425",left:"0",right:"0",index:"-0.00308",maxWeight:"3174"},
      ]},
    ]},
    {id:"c3",number:3,uldGroups:[
      {id:"g9",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
        {name:"31L",fwd:"40.118",aft:"41.659",left:"0",   right:"2.82",index:"0.00182",maxWeight:"1587"},
        {name:"31R",fwd:"40.118",aft:"41.659",left:"2.82",right:"0",   index:"0.00182",maxWeight:"1587"},
        {name:"32L",fwd:"42.582",aft:"44.122",left:"0",   right:"2.82",index:"0.0028", maxWeight:"1587"},
        {name:"32R",fwd:"42.582",aft:"44.122",left:"2.82",right:"0",   index:"0.0028", maxWeight:"1587"},
        {name:"33L",fwd:"44.165",aft:"45.705",left:"0",   right:"2.82",index:"0.00343",maxWeight:"1587"},
        {name:"33R",fwd:"44.165",aft:"45.705",left:"2.82",right:"0",   index:"0.00343",maxWeight:"1587"},
        {name:"34L",fwd:"45.747",aft:"47.287",left:"0",   right:"2.82",index:"0.00407",maxWeight:"1587"},
        {name:"34R",fwd:"45.747",aft:"47.287",left:"2.82",right:"0",   index:"0.00407",maxWeight:"1587"},
      ]},
      {id:"g10",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
        {name:"31P",fwd:"40.118",aft:"42.36", left:"0",right:"0",index:"0.00196",maxWeight:"4626"},
        {name:"32P",fwd:"42.582",aft:"44.824",left:"0",right:"0",index:"0.00294",maxWeight:"4626"},
        {name:"33P",fwd:"44.843",aft:"47.085",left:"0",right:"0",index:"0.00385",maxWeight:"4626"},
      ]},
      {id:"g11",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
        {name:"31P",fwd:"40.118",aft:"42.563",left:"0",right:"0",index:"0.002",  maxWeight:"5103"},
        {name:"32P",fwd:"42.582",aft:"45.027",left:"0",right:"0",index:"0.00298",maxWeight:"5103"},
        {name:"33P",fwd:"44.843",aft:"47.287",left:"0",right:"0",index:"0.00389",maxWeight:"5103"},
      ]},
      {id:"g12",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
        {name:"31",fwd:"40.118",aft:"41.659",left:"0",right:"0",index:"0.00182",maxWeight:"3174"},
        {name:"32",fwd:"42.582",aft:"44.122",left:"0",right:"0",index:"0.0028", maxWeight:"3174"},
        {name:"33",fwd:"44.165",aft:"45.705",left:"0",right:"0",index:"0.00343",maxWeight:"3174"},
        {name:"34",fwd:"45.747",aft:"47.287",left:"0",right:"0",index:"0.00407",maxWeight:"3174"},
      ]},
    ]},
    {id:"c4",number:4,uldGroups:[
      {id:"g13",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
        {name:"41L",fwd:"47.306",aft:"48.847",left:"0",   right:"2.82",index:"0.00469",maxWeight:"1587"},
        {name:"41R",fwd:"47.306",aft:"48.847",left:"2.82",right:"0",   index:"0.00469",maxWeight:"1587"},
        {name:"42L",fwd:"48.889",aft:"50.429",left:"0",   right:"2.82",index:"0.00532",maxWeight:"1587"},
        {name:"42R",fwd:"48.889",aft:"50.429",left:"2.82",right:"0",   index:"0.00532",maxWeight:"1587"},
        {name:"43L",fwd:"50.471",aft:"52.011",left:"0",   right:"2.82",index:"0.00596",maxWeight:"1587"},
        {name:"43R",fwd:"50.471",aft:"52.011",left:"2.82",right:"0",   index:"0.00596",maxWeight:"1587"},
      ]},
      {id:"g14",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
        {name:"41P",fwd:"47.306",aft:"49.548",left:"0",right:"0",index:"0.00483",maxWeight:"4626"},
        {name:"42P",fwd:"49.567",aft:"51.809",left:"0",right:"0",index:"0.00574",maxWeight:"4626"},
      ]},
      {id:"g15",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
        {name:"41P",fwd:"47.103",aft:"49.548",left:"0",right:"0",index:"0.00479",maxWeight:"5103"},
        {name:"42P",fwd:"49.567",aft:"52.012",left:"0",right:"0",index:"0.00578",maxWeight:"5103"},
      ]},
      {id:"g16",uldType:"LD8",iata:"PLA",label:"LD8 — PLA",positions:[
        {name:"41",fwd:"47.306",aft:"48.847",left:"0",right:"0",index:"0.00469",maxWeight:"3174"},
        {name:"42",fwd:"48.889",aft:"50.429",left:"0",right:"0",index:"0.00532",maxWeight:"3174"},
        {name:"43",fwd:"50.471",aft:"52.011",left:"0",right:"0",index:"0.00596",maxWeight:"3174"},
      ]},
    ]},
  ]
};

var TPL_B777 = {
  name:"Boeing 777-200", refStation:"1244.13",
  ulds:[
    {id:"u1",uldType:"LD3",     iata:"AKE",maxWeight:1587,tare:70},
    {id:"u2",uldType:"L3P/PKC", iata:"PKC",maxWeight:1587,tare:30},
    {id:"u3",uldType:"LD7/P88", iata:"PAG",maxWeight:5102,tare:110},
    {id:"u4",uldType:"LD7/P96", iata:"PMC",maxWeight:6350,tare:120},
    {id:"u5",uldType:"PLA",     iata:"PLA",maxWeight:3175,tare:100},
    {id:"u6",uldType:"LD6",     iata:"ALF",maxWeight:3175,tare:160},
  ],
  compartments:[
  {id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"11L",fwd:"411",  aft:"471.7",left:"0", right:"48",index:"-0.00803",maxWeight:"1587"},
      {name:"11R",fwd:"411",  aft:"471.7",left:"48",right:"0", index:"-0.00803",maxWeight:"1587"},
      {name:"12L",fwd:"509.1",aft:"570.1",left:"0", right:"48",index:"-0.00705",maxWeight:"1587"},
      {name:"12R",fwd:"509.1",aft:"570.1",left:"48",right:"0", index:"-0.00705",maxWeight:"1587"},
      {name:"13L",fwd:"571.8",aft:"632.3",left:"0", right:"48",index:"-0.00642",maxWeight:"1587"},
      {name:"13R",fwd:"571.8",aft:"632.3",left:"48",right:"0", index:"-0.00642",maxWeight:"1587"},
      {name:"14L",fwd:"632.3",aft:"692.9",left:"0", right:"48",index:"-0.00582",maxWeight:"1587"},
      {name:"14R",fwd:"632.3",aft:"692.9",left:"48",right:"0", index:"-0.00582",maxWeight:"1587"},
    ]},
    {id:"g2",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"11L",fwd:"411",  aft:"471.7",left:"0", right:"48",index:"-0.00803",maxWeight:"1587"},
      {name:"11R",fwd:"411",  aft:"471.7",left:"48",right:"0", index:"-0.00803",maxWeight:"1587"},
      {name:"12L",fwd:"509.1",aft:"570.1",left:"0", right:"48",index:"-0.00705",maxWeight:"1587"},
      {name:"12R",fwd:"509.1",aft:"570.1",left:"48",right:"0", index:"-0.00705",maxWeight:"1587"},
      {name:"13L",fwd:"571.8",aft:"632.3",left:"0", right:"48",index:"-0.00642",maxWeight:"1587"},
      {name:"13R",fwd:"571.8",aft:"632.3",left:"48",right:"0", index:"-0.00642",maxWeight:"1587"},
      {name:"14L",fwd:"632.3",aft:"692.9",left:"0", right:"48",index:"-0.00582",maxWeight:"1587"},
      {name:"14R",fwd:"632.3",aft:"692.9",left:"48",right:"0", index:"-0.00582",maxWeight:"1587"},
    ]},
    {id:"g3",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"11",fwd:"411",  aft:"471.7",left:"0",right:"0",index:"-0.00803",maxWeight:"3175"},
      {name:"12",fwd:"509.1",aft:"570.1",left:"0",right:"0",index:"-0.00705",maxWeight:"3175"},
      {name:"13",fwd:"571.8",aft:"632.3",left:"0",right:"0",index:"-0.00642",maxWeight:"3175"},
      {name:"14",fwd:"632.3",aft:"692.9",left:"0",right:"0",index:"-0.00582",maxWeight:"3175"},
    ]},
    {id:"g4",uldType:"LD6",iata:"ALF",label:"LD6 — ALF",positions:[
      {name:"11",fwd:"411",  aft:"471.7",left:"0",right:"0",index:"-0.00803",maxWeight:"3175"},
      {name:"12",fwd:"509.1",aft:"570.1",left:"0",right:"0",index:"-0.00705",maxWeight:"3175"},
      {name:"13",fwd:"571.8",aft:"632.3",left:"0",right:"0",index:"-0.00642",maxWeight:"3175"},
      {name:"14",fwd:"632.3",aft:"692.9",left:"0",right:"0",index:"-0.00582",maxWeight:"3175"},
    ]},
    {id:"g5",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"11P",fwd:"411",  aft:"507.3",left:"0",right:"0",index:"-0.00785",maxWeight:"4676"},
      {name:"12P",fwd:"509.1",aft:"605.3",left:"0",right:"0",index:"-0.00687",maxWeight:"4676"},
      {name:"13P",fwd:"606.7",aft:"703.0",left:"0",right:"0",index:"-0.00589",maxWeight:"4676"},
    ]},
    {id:"g6",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"11P",fwd:"411",  aft:"507.3",left:"0",right:"0",index:"-0.00785",maxWeight:"5102"},
      {name:"12P",fwd:"509.1",aft:"605.3",left:"0",right:"0",index:"-0.00687",maxWeight:"5102"},
      {name:"13P",fwd:"606.7",aft:"703.0",left:"0",right:"0",index:"-0.00589",maxWeight:"5102"},
    ]},
  ]},
  {id:"c2",number:2,uldGroups:[
    {id:"g7",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"21L",fwd:"692.9",aft:"753.5",left:"0", right:"48",index:"-0.00521",maxWeight:"1587"},
      {name:"21R",fwd:"692.9",aft:"753.5",left:"48",right:"0", index:"-0.00521",maxWeight:"1587"},
      {name:"22L",fwd:"753.5",aft:"814.1",left:"0", right:"48",index:"-0.00460",maxWeight:"1587"},
      {name:"22R",fwd:"753.5",aft:"814.1",left:"48",right:"0", index:"-0.00460",maxWeight:"1587"},
      {name:"23L",fwd:"814.1",aft:"874.7",left:"0", right:"48",index:"-0.00400",maxWeight:"1587"},
      {name:"23R",fwd:"814.1",aft:"874.7",left:"48",right:"0", index:"-0.00400",maxWeight:"1587"},
      {name:"24L",fwd:"874.7",aft:"935.3",left:"0", right:"48",index:"-0.00339",maxWeight:"1587"},
      {name:"24R",fwd:"874.7",aft:"935.3",left:"48",right:"0", index:"-0.00339",maxWeight:"1587"},
      {name:"25L",fwd:"935.3",aft:"996",  left:"0", right:"48",index:"-0.00278",maxWeight:"1587"},
      {name:"25R",fwd:"935.3",aft:"996",  left:"48",right:"0", index:"-0.00278",maxWeight:"1587"},
    ]},
    {id:"g8",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"21L",fwd:"692.9",aft:"753.5",left:"0", right:"48",index:"-0.00521",maxWeight:"1587"},
      {name:"21R",fwd:"692.9",aft:"753.5",left:"48",right:"0", index:"-0.00521",maxWeight:"1587"},
      {name:"22L",fwd:"753.5",aft:"814.1",left:"0", right:"48",index:"-0.00460",maxWeight:"1587"},
      {name:"22R",fwd:"753.5",aft:"814.1",left:"48",right:"0", index:"-0.00460",maxWeight:"1587"},
      {name:"23L",fwd:"814.1",aft:"874.7",left:"0", right:"48",index:"-0.00400",maxWeight:"1587"},
      {name:"23R",fwd:"814.1",aft:"874.7",left:"48",right:"0", index:"-0.00400",maxWeight:"1587"},
      {name:"24L",fwd:"874.7",aft:"935.3",left:"0", right:"48",index:"-0.00339",maxWeight:"1587"},
      {name:"24R",fwd:"874.7",aft:"935.3",left:"48",right:"0", index:"-0.00339",maxWeight:"1587"},
      {name:"25L",fwd:"935.3",aft:"996",  left:"0", right:"48",index:"-0.00278",maxWeight:"1587"},
      {name:"25R",fwd:"935.3",aft:"996",  left:"48",right:"0", index:"-0.00278",maxWeight:"1587"},
    ]},
    {id:"g9",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"21",fwd:"692.9",aft:"753.5",left:"0",right:"0",index:"-0.00521",maxWeight:"3175"},
      {name:"22",fwd:"753.5",aft:"814.1",left:"0",right:"0",index:"-0.00460",maxWeight:"3175"},
      {name:"23",fwd:"814.1",aft:"874.7",left:"0",right:"0",index:"-0.00400",maxWeight:"3175"},
      {name:"24",fwd:"874.7",aft:"935.3",left:"0",right:"0",index:"-0.00339",maxWeight:"3175"},
      {name:"25",fwd:"935.3",aft:"996",  left:"0",right:"0",index:"-0.00278",maxWeight:"3175"},
    ]},
    {id:"g10",uldType:"LD6",iata:"ALF",label:"LD6 — ALF",positions:[
      {name:"21",fwd:"692.9",aft:"753.5",left:"0",right:"0",index:"-0.00521",maxWeight:"3175"},
      {name:"22",fwd:"753.5",aft:"814.1",left:"0",right:"0",index:"-0.00460",maxWeight:"3175"},
      {name:"23",fwd:"814.1",aft:"874.7",left:"0",right:"0",index:"-0.00400",maxWeight:"3175"},
      {name:"24",fwd:"874.7",aft:"935.3",left:"0",right:"0",index:"-0.00339",maxWeight:"3175"},
      {name:"25",fwd:"935.3",aft:"996",  left:"0",right:"0",index:"-0.00278",maxWeight:"3175"},
    ]},
    {id:"g11",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"21P",fwd:"704.4",aft:"800.7",left:"0",right:"0",index:"-0.00492",maxWeight:"4676"},
      {name:"22P",fwd:"802.1",aft:"898.3",left:"0",right:"0",index:"-0.00394",maxWeight:"4676"},
      {name:"23P",fwd:"899.8",aft:"996.0",left:"0",right:"0",index:"-0.00296",maxWeight:"5102"},
    ]},
    {id:"g12",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"21P",fwd:"704.4",aft:"800.7",left:"0",right:"0",index:"-0.00492",maxWeight:"5102"},
      {name:"22P",fwd:"802.1",aft:"898.3",left:"0",right:"0",index:"-0.00394",maxWeight:"5102"},
      {name:"23P",fwd:"899.8",aft:"996.0",left:"0",right:"0",index:"-0.00296",maxWeight:"6350"},
    ]},
  ]},
  {id:"c3",number:3,uldGroups:[
    {id:"g13",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"31L",fwd:"1442.1",aft:"1502.8",left:"0", right:"48",index:"0.00228",maxWeight:"1587"},
      {name:"31R",fwd:"1442.1",aft:"1502.8",left:"48",right:"0", index:"0.00228",maxWeight:"1587"},
      {name:"32L",fwd:"1502.8",aft:"1563.4",left:"0", right:"48",index:"0.00289",maxWeight:"1587"},
      {name:"32R",fwd:"1502.8",aft:"1563.4",left:"48",right:"0", index:"0.00289",maxWeight:"1587"},
      {name:"33L",fwd:"1563.4",aft:"1624.3",left:"0", right:"48",index:"0.00350",maxWeight:"1587"},
      {name:"33R",fwd:"1563.4",aft:"1624.3",left:"48",right:"0", index:"0.00350",maxWeight:"1587"},
    ]},
    {id:"g14",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"31L",fwd:"1442.1",aft:"1502.8",left:"0", right:"48",index:"0.00228",maxWeight:"1587"},
      {name:"31R",fwd:"1442.1",aft:"1502.8",left:"48",right:"0", index:"0.00228",maxWeight:"1587"},
      {name:"32L",fwd:"1502.8",aft:"1563.4",left:"0", right:"48",index:"0.00289",maxWeight:"1587"},
      {name:"32R",fwd:"1502.8",aft:"1563.4",left:"48",right:"0", index:"0.00289",maxWeight:"1587"},
      {name:"33L",fwd:"1563.4",aft:"1624.3",left:"0", right:"48",index:"0.00350",maxWeight:"1560"},
      {name:"33R",fwd:"1563.4",aft:"1624.3",left:"48",right:"0", index:"0.00350",maxWeight:"1560"},
    ]},
    {id:"g15",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"31",fwd:"1442.1",aft:"1502.8",left:"0",right:"0",index:"0.00228",maxWeight:"3175"},
      {name:"32",fwd:"1502.8",aft:"1563.4",left:"0",right:"0",index:"0.00289",maxWeight:"3175"},
      {name:"33",fwd:"1563.4",aft:"1624.3",left:"0",right:"0",index:"0.00350",maxWeight:"3116"},
    ]},
    {id:"g16",uldType:"LD6",iata:"ALF",label:"LD6 — ALF",positions:[
      {name:"31",fwd:"1442.1",aft:"1502.8",left:"0",right:"0",index:"0.00228",maxWeight:"3175"},
      {name:"32",fwd:"1502.8",aft:"1563.4",left:"0",right:"0",index:"0.00289",maxWeight:"3175"},
      {name:"33",fwd:"1563.4",aft:"1624.3",left:"0",right:"0",index:"0.00350",maxWeight:"3175"},
    ]},
    {id:"g17",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"31P",fwd:"1442.1",aft:"1538.3",left:"0",right:"0",index:"0.00246",maxWeight:"5102"},
      {name:"32P",fwd:"1539.7",aft:"1636.0",left:"0",right:"0",index:"0.00344",maxWeight:"4676"},
    ]},
    {id:"g18",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"31P",fwd:"1442.1",aft:"1538.3",left:"0",right:"0",index:"0.00246",maxWeight:"6350"},
      {name:"32P",fwd:"1539.7",aft:"1636.0",left:"0",right:"0",index:"0.00344",maxWeight:"5102"},
    ]},
  ]},
  {id:"c4",number:4,uldGroups:[
    {id:"g19",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"41L",fwd:"1624.3",aft:"1684.1",left:"0", right:"48",index:"0.00410",maxWeight:"1587"},
      {name:"41R",fwd:"1624.3",aft:"1684.1",left:"48",right:"0", index:"0.00410",maxWeight:"1587"},
      {name:"42L",fwd:"1686.1",aft:"1747.1",left:"0", right:"48",index:"0.00472",maxWeight:"1587"},
      {name:"42R",fwd:"1686.1",aft:"1747.1",left:"48",right:"0", index:"0.00472",maxWeight:"1587"},
      {name:"43L",fwd:"1758.7",aft:"1819.3",left:"0", right:"48",index:"0.00545",maxWeight:"1587"},
      {name:"43R",fwd:"1758.7",aft:"1819.3",left:"48",right:"0", index:"0.00545",maxWeight:"1587"},
      {name:"44L",fwd:"1819.3",aft:"1880.0",left:"0", right:"48",index:"0.00605",maxWeight:"1587"},
      {name:"44R",fwd:"1819.3",aft:"1880.0",left:"48",right:"0", index:"0.00605",maxWeight:"1587"},
    ]},
    {id:"g20",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"41L",fwd:"1624.3",aft:"1684.1",left:"0", right:"48",index:"0.00410",maxWeight:"1478"},
      {name:"41R",fwd:"1624.3",aft:"1684.1",left:"48",right:"0", index:"0.00410",maxWeight:"1478"},
      {name:"42L",fwd:"1686.1",aft:"1747.1",left:"0", right:"48",index:"0.00472",maxWeight:"1406"},
      {name:"42R",fwd:"1686.1",aft:"1747.1",left:"48",right:"0", index:"0.00472",maxWeight:"1406"},
      {name:"43L",fwd:"1758.7",aft:"1819.3",left:"0", right:"48",index:"0.00545",maxWeight:"1338"},
      {name:"43R",fwd:"1758.7",aft:"1819.3",left:"48",right:"0", index:"0.00545",maxWeight:"1338"},
      {name:"44L",fwd:"1819.3",aft:"1880.0",left:"0", right:"48",index:"0.00605",maxWeight:"1279"},
      {name:"44R",fwd:"1819.3",aft:"1880.0",left:"48",right:"0", index:"0.00605",maxWeight:"1279"},
    ]},
    {id:"g21",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"41",fwd:"1624.3",aft:"1684.1",left:"0",right:"0",index:"0.00410",maxWeight:"2957"},
      {name:"42",fwd:"1686.1",aft:"1747.1",left:"0",right:"0",index:"0.00472",maxWeight:"2812"},
      {name:"43",fwd:"1758.7",aft:"1819.3",left:"0",right:"0",index:"0.00545",maxWeight:"2680"},
      {name:"44",fwd:"1819.3",aft:"1880.0",left:"0",right:"0",index:"0.00605",maxWeight:"2558"},
    ]},
    {id:"g22",uldType:"LD6",iata:"ALF",label:"LD6 — ALF",positions:[
      {name:"41",fwd:"1624.3",aft:"1684.1",left:"0",right:"0",index:"0.00410",maxWeight:"3175"},
      {name:"42",fwd:"1686.1",aft:"1747.1",left:"0",right:"0",index:"0.00472",maxWeight:"3175"},
      {name:"43",fwd:"1758.7",aft:"1819.3",left:"0",right:"0",index:"0.00545",maxWeight:"3175"},
      {name:"44",fwd:"1819.3",aft:"1880.0",left:"0",right:"0",index:"0.00605",maxWeight:"3175"},
    ]},
    {id:"g23",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"41P",fwd:"1686.1",aft:"1782.3",left:"0",right:"0",index:"0.00490",maxWeight:"4676"},
      {name:"42P",fwd:"1783.7",aft:"1880.0",left:"0",right:"0",index:"0.00588",maxWeight:"4676"},
    ]},
    {id:"g24",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"41P",fwd:"1686.1",aft:"1782.3",left:"0",right:"0",index:"0.00490",maxWeight:"5102"},
      {name:"42P",fwd:"1783.7",aft:"1880.0",left:"0",right:"0",index:"0.00588",maxWeight:"5102"},
    ]},
  ]},
  ]
};

var TPL_A330_200 = {
  name:"Airbus A330-200", refStation:"33.1555",
  ulds:[
    {id:"u1",uldType:"LD3",     iata:"AKE",maxWeight:1587,tare:63},
    {id:"u2",uldType:"L3P/PKC", iata:"PKC",maxWeight:1587,tare:37},
    {id:"u3",uldType:"LD7/P88", iata:"PAG",maxWeight:4626,tare:85},
    {id:"u4",uldType:"LD7/P96", iata:"PMC",maxWeight:5103,tare:91},
    {id:"u5",uldType:"PLA",     iata:"PLA",maxWeight:3174,tare:90},
  ],
  compartments:[
  {id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"11L",fwd:"14.663",aft:"16.198",left:"0", right:"2.82",index:"-0.00709",maxWeight:"1587"},
      {name:"11R",fwd:"14.663",aft:"16.198",left:"2.82",right:"0", index:"-0.00709",maxWeight:"1587"},
      {name:"12L",fwd:"16.438",aft:"17.973",left:"0", right:"2.82",index:"-0.00638",maxWeight:"1587"},
      {name:"12R",fwd:"16.438",aft:"17.973",left:"2.82",right:"0", index:"-0.00638",maxWeight:"1587"},
      {name:"13L",fwd:"18.013",aft:"19.548",left:"0", right:"2.82",index:"-0.00575",maxWeight:"1587"},
      {name:"13R",fwd:"18.013",aft:"19.548",left:"2.82",right:"0", index:"-0.00575",maxWeight:"1587"},
      {name:"14L",fwd:"19.588",aft:"21.123",left:"0", right:"2.82",index:"-0.00512",maxWeight:"1587"},
      {name:"14R",fwd:"19.588",aft:"21.123",left:"2.82",right:"0", index:"-0.00512",maxWeight:"1587"},
    ]},
    {id:"g2",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"11L",fwd:"14.663",aft:"16.198",left:"0", right:"2.82",index:"-0.00709",maxWeight:"1587"},
      {name:"11R",fwd:"14.663",aft:"16.198",left:"2.82",right:"0", index:"-0.00709",maxWeight:"1587"},
      {name:"12L",fwd:"16.438",aft:"17.973",left:"0", right:"2.82",index:"-0.00638",maxWeight:"1587"},
      {name:"12R",fwd:"16.438",aft:"17.973",left:"2.82",right:"0", index:"-0.00638",maxWeight:"1587"},
      {name:"13L",fwd:"18.013",aft:"19.548",left:"0", right:"2.82",index:"-0.00575",maxWeight:"1587"},
      {name:"13R",fwd:"18.013",aft:"19.548",left:"2.82",right:"0", index:"-0.00575",maxWeight:"1587"},
      {name:"14L",fwd:"19.588",aft:"21.123",left:"0", right:"2.82",index:"-0.00512",maxWeight:"1587"},
      {name:"14R",fwd:"19.588",aft:"21.123",left:"2.82",right:"0", index:"-0.00512",maxWeight:"1587"},
    ]},
    {id:"g3",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"11",fwd:"14.663",aft:"16.198",left:"0",right:"0",index:"-0.00709",maxWeight:"3174"},
      {name:"12",fwd:"16.438",aft:"17.973",left:"0",right:"0",index:"-0.00638",maxWeight:"3174"},
      {name:"13",fwd:"18.013",aft:"19.548",left:"0",right:"0",index:"-0.00575",maxWeight:"3174"},
      {name:"14",fwd:"19.588",aft:"21.123",left:"0",right:"0",index:"-0.00512",maxWeight:"3174"},
    ]},
    {id:"g4",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"12P",fwd:"16.378",aft:"18.613",left:"0",right:"0",index:"-0.006264",maxWeight:"4626"},
      {name:"13P",fwd:"18.843",aft:"21.078",left:"0",right:"0",index:"-0.005278",maxWeight:"4626"},
    ]},
    {id:"g5",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"12P",fwd:"16.276",aft:"18.715",left:"0",right:"0",index:"-0.006264",maxWeight:"5103"},
      {name:"13P",fwd:"18.741",aft:"21.180",left:"0",right:"0",index:"-0.005278",maxWeight:"5103"},
    ]},
  ]},
  {id:"c2",number:2,uldGroups:[
    {id:"g6",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"21L",fwd:"21.363",aft:"22.898",left:"0", right:"2.82",index:"-0.00441",maxWeight:"1587"},
      {name:"21R",fwd:"21.363",aft:"22.898",left:"2.82",right:"0", index:"-0.00441",maxWeight:"1587"},
      {name:"22L",fwd:"22.938",aft:"24.473",left:"0", right:"2.82",index:"-0.00378",maxWeight:"1587"},
      {name:"22R",fwd:"22.938",aft:"24.473",left:"2.82",right:"0", index:"-0.00378",maxWeight:"1587"},
      {name:"23L",fwd:"24.513",aft:"26.048",left:"0", right:"2.82",index:"-0.00315",maxWeight:"1587"},
      {name:"23R",fwd:"24.513",aft:"26.048",left:"2.82",right:"0", index:"-0.00315",maxWeight:"1587"},
    ]},
    {id:"g7",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"21L",fwd:"21.363",aft:"22.898",left:"0", right:"2.82",index:"-0.00441",maxWeight:"1587"},
      {name:"21R",fwd:"21.363",aft:"22.898",left:"2.82",right:"0", index:"-0.00441",maxWeight:"1587"},
      {name:"22L",fwd:"22.938",aft:"24.473",left:"0", right:"2.82",index:"-0.00378",maxWeight:"1587"},
      {name:"22R",fwd:"22.938",aft:"24.473",left:"2.82",right:"0", index:"-0.00378",maxWeight:"1587"},
      {name:"23L",fwd:"24.513",aft:"26.048",left:"0", right:"2.82",index:"-0.00315",maxWeight:"1587"},
      {name:"23R",fwd:"24.513",aft:"26.048",left:"2.82",right:"0", index:"-0.00315",maxWeight:"1587"},
    ]},
    {id:"g8",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"21",fwd:"21.363",aft:"22.898",left:"0",right:"0",index:"-0.00441",maxWeight:"3174"},
      {name:"22",fwd:"22.938",aft:"24.473",left:"0",right:"0",index:"-0.00378",maxWeight:"3174"},
      {name:"23",fwd:"24.513",aft:"26.048",left:"0",right:"0",index:"-0.00315",maxWeight:"3174"},
    ]},
    {id:"g9",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"21P",fwd:"21.313",aft:"23.548",left:"0",right:"0",index:"-0.004290",maxWeight:"4626"},
      {name:"22P",fwd:"23.763",aft:"25.998",left:"0",right:"0",index:"-0.003310",maxWeight:"4626"},
    ]},
    {id:"g10",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"21P",fwd:"21.211",aft:"23.650",left:"0",right:"0",index:"-0.004290",maxWeight:"5103"},
      {name:"22P",fwd:"23.661",aft:"26.100",left:"0",right:"0",index:"-0.003310",maxWeight:"5103"},
    ]},
  ]},
  {id:"c3",number:3,uldGroups:[
    {id:"g11",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"33L",fwd:"40.013",aft:"41.548",left:"0", right:"2.82",index:"0.003050",maxWeight:"1587"},
      {name:"33R",fwd:"40.013",aft:"41.548",left:"2.82",right:"0", index:"0.003050",maxWeight:"1587"},
    ]},
    {id:"g12",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"33L",fwd:"40.013",aft:"41.548",left:"0", right:"2.82",index:"0.003050",maxWeight:"1587"},
      {name:"33R",fwd:"40.013",aft:"41.548",left:"2.82",right:"0", index:"0.003050",maxWeight:"1587"},
    ]},
    {id:"g13",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"33",fwd:"40.013",aft:"41.548",left:"0",right:"0",index:"0.003050",maxWeight:"3174"},
    ]},
    {id:"g14",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"32P",fwd:"39.413",aft:"41.648",left:"0",right:"0",index:"0.002950",maxWeight:"4626"},
    ]},
  ]},
  {id:"c4",number:4,uldGroups:[
    {id:"g15",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      {name:"41L",fwd:"41.988",aft:"43.523",left:"0", right:"2.82",index:"0.003840",maxWeight:"1587"},
      {name:"41R",fwd:"41.988",aft:"43.523",left:"2.82",right:"0", index:"0.003840",maxWeight:"1587"},
      {name:"42L",fwd:"43.563",aft:"45.098",left:"0", right:"2.82",index:"0.004470",maxWeight:"1587"},
      {name:"42R",fwd:"43.563",aft:"45.098",left:"2.82",right:"0", index:"0.004470",maxWeight:"1587"},
      {name:"43L",fwd:"45.138",aft:"46.673",left:"0", right:"2.82",index:"0.005100",maxWeight:"1587"},
      {name:"43R",fwd:"45.138",aft:"46.673",left:"2.82",right:"0", index:"0.005100",maxWeight:"1587"},
    ]},
    {id:"g16",uldType:"L3P/PKC",iata:"PKC",label:"L3P/PKC — PKC (pallet)",positions:[
      {name:"41L",fwd:"41.988",aft:"43.523",left:"0", right:"2.82",index:"0.003840",maxWeight:"1587"},
      {name:"41R",fwd:"41.988",aft:"43.523",left:"2.82",right:"0", index:"0.003840",maxWeight:"1587"},
      {name:"42L",fwd:"43.563",aft:"45.098",left:"0", right:"2.82",index:"0.004470",maxWeight:"1587"},
      {name:"42R",fwd:"43.563",aft:"45.098",left:"2.82",right:"0", index:"0.004470",maxWeight:"1587"},
      {name:"43L",fwd:"45.138",aft:"46.673",left:"0", right:"2.82",index:"0.005100",maxWeight:"1587"},
      {name:"43R",fwd:"45.138",aft:"46.673",left:"2.82",right:"0", index:"0.005100",maxWeight:"1587"},
    ]},
    {id:"g17",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"41",fwd:"41.988",aft:"43.523",left:"0",right:"0",index:"0.003840",maxWeight:"3174"},
      {name:"42",fwd:"43.563",aft:"45.098",left:"0",right:"0",index:"0.004470",maxWeight:"3174"},
      {name:"43",fwd:"45.138",aft:"46.673",left:"0",right:"0",index:"0.005100",maxWeight:"3174"},
    ]},
    {id:"g18",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"41P",fwd:"41.938",aft:"44.173",left:"0",right:"0",index:"0.003960",maxWeight:"4626"},
      {name:"42P",fwd:"44.288",aft:"46.523",left:"0",right:"0",index:"0.004900",maxWeight:"4626"},
    ]},
    {id:"g19",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"41P",fwd:"41.836",aft:"44.275",left:"0",right:"0",index:"0.003960",maxWeight:"5103"},
      {name:"42P",fwd:"44.186",aft:"46.625",left:"0",right:"0",index:"0.004900",maxWeight:"5103"},
    ]},
  ]},
  ]
};

var TPL_B777_300 = {
  name:"Boeing 777-300", refStation:"1258",
  ulds:[
    {id:"u1", uldType:"LD3",    iata:"AKE",maxWeight:1587,tare:65},
    {id:"u2", uldType:"LD3",    iata:"QKE",maxWeight:1587,tare:74},
    {id:"u3", uldType:"LD3",    iata:"PKC",maxWeight:1587,tare:40},
    {id:"u4", uldType:"LD7/P88",iata:"PAG",maxWeight:4626,tare:100},
    {id:"u5", uldType:"LD7/P96",iata:"PMC",maxWeight:5102,tare:110},
    {id:"u6", uldType:"PLA",    iata:"PLA",maxWeight:3174,tare:70},
    {id:"u7", uldType:"LD3",    iata:"RKN",maxWeight:1587,tare:210},
    {id:"u8", uldType:"LD7/P88",iata:"RAP",maxWeight:6033,tare:450},
    {id:"u9", uldType:"LD3",    iata:"AKC",maxWeight:1587,tare:80},
    {id:"u10",uldType:"LD2",    iata:"DPE",maxWeight:1224,tare:72},
    {id:"u11",uldType:"LD11",   iata:"DQP",maxWeight:2449,tare:120},
    {id:"u12",uldType:"LD7/P88",iata:"UAK",maxWeight:5102,tare:200},
    {id:"u13",uldType:"LD11",   iata:"DQF",maxWeight:2449,tare:150},
    {id:"u14",uldType:"LD7/P88",iata:"AAP",maxWeight:5102,tare:200},
    {id:"u15",uldType:"PLA",    iata:"ALK",maxWeight:3175,tare:180},
    {id:"u16",uldType:"PLA",    iata:"ALP",maxWeight:3175,tare:180},
    {id:"u17",uldType:"LD11",   iata:"FQA",maxWeight:2449,tare:53},
  ],
  // The position compatibility table (2.3) covers only AKE/PKC/PLA/PAG/PMC.
  // DQF/DQP/FQA are placed anyway, in the P bays, on the operator's word —
  // see the note on those groups. The rest (RKN, RAP, AKC, DPE, UAK, AAP,
  // ALK, ALP, and QKE, a fire-resistant AKE) are in the catalog for manual
  // use but are not assigned to any position group here.
  compartments:[
  {id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"11L",fwd:"201.1",aft:"261.7",left:"0", right:"48",index:"-0.003422",maxWeight:"1587"},
      {name:"11R",fwd:"201.1",aft:"261.7",left:"48",right:"0", index:"-0.003422",maxWeight:"1587"},
      {name:"12L",fwd:"299.1",aft:"360.1",left:"0", right:"48",index:"-0.003095",maxWeight:"1587"},
      {name:"12R",fwd:"299.1",aft:"360.1",left:"48",right:"0", index:"-0.003095",maxWeight:"1587"},
      {name:"13L",fwd:"376.3",aft:"436.7",left:"0", right:"48",index:"-0.002838",maxWeight:"1587"},
      {name:"13R",fwd:"376.3",aft:"436.7",left:"48",right:"0", index:"-0.002838",maxWeight:"1587"},
      {name:"14L",fwd:"436.7",aft:"497.1",left:"0", right:"48",index:"-0.002637",maxWeight:"1587"},
      {name:"14R",fwd:"436.7",aft:"497.1",left:"48",right:"0", index:"-0.002637",maxWeight:"1587"},
    ]},
    {id:"g3",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"11",fwd:"201.1",aft:"261.7",left:"0",right:"0",index:"-0.003422",maxWeight:"3174"},
      {name:"12",fwd:"299.1",aft:"360.1",left:"0",right:"0",index:"-0.003095",maxWeight:"3174"},
      {name:"13",fwd:"376.3",aft:"436.7",left:"0",right:"0",index:"-0.002838",maxWeight:"3174"},
      {name:"14",fwd:"436.7",aft:"497.1",left:"0",right:"0",index:"-0.002637",maxWeight:"3174"},
    ]},
    {id:"g4",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"11P",fwd:"201.1",aft:"289.3",left:"0",right:"0",index:"-0.003376",maxWeight:"4626"},
      {name:"12P",fwd:"299.1",aft:"387.3",left:"0",right:"0",index:"-0.003049",maxWeight:"4626"},
      {name:"13P",fwd:"404.7",aft:"493.0",left:"0",right:"0",index:"-0.002697",maxWeight:"4626"},
    ]},
    {id:"g5",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"11P",fwd:"201.1",aft:"297.3",left:"0",right:"0",index:"-0.003363",maxWeight:"5102"},
      {name:"12P",fwd:"299.1",aft:"395.3",left:"0",right:"0",index:"-0.003036",maxWeight:"5102"},
      {name:"13P",fwd:"396.7",aft:"493.0",left:"0",right:"0",index:"-0.002711",maxWeight:"5102"},
    ]},
    // LD11 (DQF/DQP/FQA) share the P bays with the pallets. The manual has
    // no station table of its own for them, so the operator asked for the
    // PMC row's stations and index — the bay is the same. The weight is the
    // LD11's own 2449 certification, not the bay ceiling the PMC gets.
    {id:"gl1",uldType:"LD11",iata:"DQF",label:"LD11 — DQF/DQP/FQA",positions:[
      {name:"11P",fwd:"201.1",aft:"297.3",left:"0",right:"0",index:"-0.003363",maxWeight:"2449"},
      {name:"12P",fwd:"299.1",aft:"395.3",left:"0",right:"0",index:"-0.003036",maxWeight:"2449"},
      {name:"13P",fwd:"396.7",aft:"493.0",left:"0",right:"0",index:"-0.002711",maxWeight:"2449"},
    ]},
  ]},
  {id:"c2",number:2,uldGroups:[
    {id:"g6",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"21L",fwd:"497.1",aft:"557.5",left:"0", right:"48",index:"-0.002436",maxWeight:"1587"},
      {name:"21R",fwd:"497.1",aft:"557.5",left:"48",right:"0", index:"-0.002436",maxWeight:"1587"},
      {name:"22L",fwd:"557.5",aft:"617.9",left:"0", right:"48",index:"-0.002234",maxWeight:"1587"},
      {name:"22R",fwd:"557.5",aft:"617.9",left:"48",right:"0", index:"-0.002234",maxWeight:"1587"},
      {name:"23L",fwd:"617.9",aft:"678.3",left:"0", right:"48",index:"-0.002033",maxWeight:"1587"},
      {name:"23R",fwd:"617.9",aft:"678.3",left:"48",right:"0", index:"-0.002033",maxWeight:"1587"},
      {name:"24L",fwd:"678.3",aft:"738.9",left:"0", right:"48",index:"-0.001831",maxWeight:"1587"},
      {name:"24R",fwd:"678.3",aft:"738.9",left:"48",right:"0", index:"-0.001831",maxWeight:"1587"},
      {name:"25L",fwd:"738.9",aft:"799.5",left:"0", right:"48",index:"-0.001629",maxWeight:"1587"},
      {name:"25R",fwd:"738.9",aft:"799.5",left:"48",right:"0", index:"-0.001629",maxWeight:"1587"},
      {name:"26L",fwd:"799.5",aft:"860.1",left:"0", right:"48",index:"-0.001427",maxWeight:"1587"},
      {name:"26R",fwd:"799.5",aft:"860.1",left:"48",right:"0", index:"-0.001427",maxWeight:"1587"},
      {name:"27L",fwd:"860.1",aft:"920.7",left:"0", right:"48",index:"-0.001225",maxWeight:"1587"},
      {name:"27R",fwd:"860.1",aft:"920.7",left:"48",right:"0", index:"-0.001225",maxWeight:"1587"},
      {name:"28L",fwd:"920.7",aft:"981.4",left:"0", right:"48",index:"-0.001023",maxWeight:"1587"},
      {name:"28R",fwd:"920.7",aft:"981.4",left:"48",right:"0", index:"-0.001023",maxWeight:"1587"},
    ]},
    {id:"g8",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"21",fwd:"497.1",aft:"557.5",left:"0",right:"0",index:"-0.002436",maxWeight:"3174"},
      {name:"22",fwd:"557.5",aft:"617.9",left:"0",right:"0",index:"-0.002234",maxWeight:"3174"},
      {name:"23",fwd:"617.9",aft:"678.3",left:"0",right:"0",index:"-0.002033",maxWeight:"3174"},
      {name:"24",fwd:"678.3",aft:"738.9",left:"0",right:"0",index:"-0.001831",maxWeight:"3174"},
      {name:"25",fwd:"738.9",aft:"799.5",left:"0",right:"0",index:"-0.001629",maxWeight:"3174"},
      {name:"26",fwd:"799.5",aft:"860.1",left:"0",right:"0",index:"-0.001427",maxWeight:"3174"},
      {name:"27",fwd:"860.1",aft:"920.7",left:"0",right:"0",index:"-0.001225",maxWeight:"3174"},
      {name:"28",fwd:"920.7",aft:"981.4",left:"0",right:"0",index:"-0.001023",maxWeight:"3174"},
    ]},
    {id:"g9",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"21P",fwd:"502.4",aft:"590.7",left:"0",right:"0",index:"-0.002372",maxWeight:"4626"},
      {name:"22P",fwd:"600.1",aft:"688.3",left:"0",right:"0",index:"-0.002046",maxWeight:"4626"},
      {name:"23P",fwd:"697.8",aft:"786.0",left:"0",right:"0",index:"-0.001720",maxWeight:"4626"},
      {name:"24P",fwd:"795.4",aft:"883.7",left:"0",right:"0",index:"-0.001395",maxWeight:"4626"},
      // *5102kg only for this position (manual remark)
      {name:"25P",fwd:"893.1",aft:"981.4",left:"0",right:"0",index:"-0.001069",maxWeight:"5102"},
    ]},
    {id:"g10",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"21P",fwd:"494.4",aft:"590.7",left:"0",right:"0",index:"-0.002385",maxWeight:"5102"},
      {name:"22P",fwd:"592.1",aft:"688.3",left:"0",right:"0",index:"-0.002059",maxWeight:"5102"},
      {name:"23P",fwd:"689.8",aft:"786.0",left:"0",right:"0",index:"-0.001734",maxWeight:"5102"},
      {name:"24P",fwd:"787.4",aft:"883.7",left:"0",right:"0",index:"-0.001408",maxWeight:"5102"},
      // **6350kg only for this position (manual remark)
      {name:"25P",fwd:"885.1",aft:"981.4",left:"0",right:"0",index:"-0.001083",maxWeight:"6350"},
    ]},
    // LD11 (DQF/DQP/FQA) share the P bays with the pallets. The manual has
    // no station table of its own for them, so the operator asked for the
    // PMC row's stations and index — the bay is the same. The weight is the
    // LD11's own 2449 certification, not the bay ceiling the PMC gets.
    {id:"gl2",uldType:"LD11",iata:"DQF",label:"LD11 — DQF/DQP/FQA",positions:[
      {name:"21P",fwd:"494.4",aft:"590.7",left:"0",right:"0",index:"-0.002385",maxWeight:"2449"},
      {name:"22P",fwd:"592.1",aft:"688.3",left:"0",right:"0",index:"-0.002059",maxWeight:"2449"},
      {name:"23P",fwd:"689.8",aft:"786.0",left:"0",right:"0",index:"-0.001734",maxWeight:"2449"},
      {name:"24P",fwd:"787.4",aft:"883.7",left:"0",right:"0",index:"-0.001408",maxWeight:"2449"},
      {name:"25P",fwd:"885.1",aft:"981.4",left:"0",right:"0",index:"-0.001083",maxWeight:"2449"},
    ]},
  ]},
  {id:"c3",number:3,uldGroups:[
    {id:"g11",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"31L",fwd:"1449.9",aft:"1510.6",left:"0", right:"48",index:"0.000741",maxWeight:"1587"},
      {name:"31R",fwd:"1449.9",aft:"1510.6",left:"48",right:"0", index:"0.000741",maxWeight:"1587"},
      {name:"32L",fwd:"1510.6",aft:"1571.2",left:"0", right:"48",index:"0.000943",maxWeight:"1587"},
      {name:"32R",fwd:"1510.6",aft:"1571.2",left:"48",right:"0", index:"0.000943",maxWeight:"1587"},
      {name:"33L",fwd:"1571.2",aft:"1631.8",left:"0", right:"48",index:"0.001145",maxWeight:"1587"},
      {name:"33R",fwd:"1571.2",aft:"1631.8",left:"48",right:"0", index:"0.001145",maxWeight:"1587"},
      {name:"34L",fwd:"1631.8",aft:"1692.4",left:"0", right:"48",index:"0.001347",maxWeight:"1587"},
      {name:"34R",fwd:"1631.8",aft:"1692.4",left:"48",right:"0", index:"0.001347",maxWeight:"1587"},
      {name:"35L",fwd:"1692.4",aft:"1753.0",left:"0", right:"48",index:"0.001549",maxWeight:"1587"},
      {name:"35R",fwd:"1692.4",aft:"1753.0",left:"48",right:"0", index:"0.001549",maxWeight:"1587"},
      {name:"36L",fwd:"1753.0",aft:"1813.4",left:"0", right:"48",index:"0.001751",maxWeight:"1587"},
      {name:"36R",fwd:"1753.0",aft:"1813.4",left:"48",right:"0", index:"0.001751",maxWeight:"1587"},
    ]},
    {id:"g13",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"31",fwd:"1449.9",aft:"1510.6",left:"0",right:"0",index:"0.000741",maxWeight:"3174"},
      {name:"32",fwd:"1510.6",aft:"1571.2",left:"0",right:"0",index:"0.000943",maxWeight:"3174"},
      {name:"33",fwd:"1571.2",aft:"1631.8",left:"0",right:"0",index:"0.001145",maxWeight:"3174"},
      {name:"34",fwd:"1631.8",aft:"1692.4",left:"0",right:"0",index:"0.001347",maxWeight:"3174"},
      {name:"35",fwd:"1692.4",aft:"1753.0",left:"0",right:"0",index:"0.001549",maxWeight:"3174"},
      {name:"36",fwd:"1753.0",aft:"1813.4",left:"0",right:"0",index:"0.001751",maxWeight:"3174"},
    ]},
    {id:"g14",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      // *5102kg only for this position (manual remark)
      {name:"31P",fwd:"1449.9",aft:"1538.1",left:"0",right:"0",index:"0.000787",maxWeight:"5102"},
      {name:"32P",fwd:"1539.5",aft:"1627.8",left:"0",right:"0",index:"0.001086",maxWeight:"4626"},
      {name:"33P",fwd:"1629.2",aft:"1717.5",left:"0",right:"0",index:"0.001385",maxWeight:"4626"},
      {name:"34P",fwd:"1718.9",aft:"1807.1",left:"0",right:"0",index:"0.001683",maxWeight:"4626"},
    ]},
    {id:"g15",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      // **6350kg only for this position (manual remark)
      {name:"31P",fwd:"1449.9",aft:"1546.1",left:"0",right:"0",index:"0.000800",maxWeight:"6350"},
      {name:"32P",fwd:"1547.5",aft:"1643.8",left:"0",right:"0",index:"0.001126",maxWeight:"5102"},
      {name:"33P",fwd:"1645.2",aft:"1741.5",left:"0",right:"0",index:"0.001451",maxWeight:"5102"},
      {name:"34P",fwd:"1742.9",aft:"1839.0",left:"0",right:"0",index:"0.001777",maxWeight:"5102"},
    ]},
    // LD11 (DQF/DQP/FQA) share the P bays with the pallets. The manual has
    // no station table of its own for them, so the operator asked for the
    // PMC row's stations and index — the bay is the same. The weight is the
    // LD11's own 2449 certification, not the bay ceiling the PMC gets.
    {id:"gl3",uldType:"LD11",iata:"DQF",label:"LD11 — DQF/DQP/FQA",positions:[
      {name:"31P",fwd:"1449.9",aft:"1546.1",left:"0",right:"0",index:"0.000800",maxWeight:"2449"},
      {name:"32P",fwd:"1547.5",aft:"1643.8",left:"0",right:"0",index:"0.001126",maxWeight:"2449"},
      {name:"33P",fwd:"1645.2",aft:"1741.5",left:"0",right:"0",index:"0.001451",maxWeight:"2449"},
      {name:"34P",fwd:"1742.9",aft:"1839.0",left:"0",right:"0",index:"0.001777",maxWeight:"2449"},
    ]},
  ]},
  {id:"c4",number:4,uldGroups:[
    {id:"g16",uldType:"LD3",iata:"AKE",label:"LD3 — AKE/PKC",positions:[
      {name:"41L",fwd:"1813.4",aft:"1873.3",left:"0", right:"48",index:"0.001951",maxWeight:"1587"},
      {name:"41R",fwd:"1813.4",aft:"1873.3",left:"48",right:"0", index:"0.001951",maxWeight:"1587"},
      {name:"42L",fwd:"1875.1",aft:"1936.1",left:"0", right:"48",index:"0.002159",maxWeight:"1587"},
      {name:"42R",fwd:"1875.1",aft:"1936.1",left:"48",right:"0", index:"0.002159",maxWeight:"1587"},
      {name:"43L",fwd:"1947.7",aft:"2008.3",left:"0", right:"48",index:"0.002400",maxWeight:"1587"},
      {name:"43R",fwd:"1947.7",aft:"2008.3",left:"48",right:"0", index:"0.002400",maxWeight:"1587"},
      {name:"44L",fwd:"2008.3",aft:"2069.0",left:"0", right:"48",index:"0.002602",maxWeight:"1587"},
      {name:"44R",fwd:"2008.3",aft:"2069.0",left:"48",right:"0", index:"0.002602",maxWeight:"1587"},
    ]},
    {id:"g18",uldType:"PLA",iata:"PLA",label:"PLA — half pallet",positions:[
      {name:"41",fwd:"1813.4",aft:"1873.3",left:"0",right:"0",index:"0.001951",maxWeight:"3174"},
      {name:"42",fwd:"1875.1",aft:"1936.1",left:"0",right:"0",index:"0.002159",maxWeight:"3174"},
      {name:"43",fwd:"1947.7",aft:"2008.3",left:"0",right:"0",index:"0.002400",maxWeight:"3174"},
      {name:"44",fwd:"2008.3",aft:"2069.0",left:"0",right:"0",index:"0.002602",maxWeight:"3174"},
    ]},
    {id:"g19",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"41P",fwd:"1873.3",aft:"1963.3",left:"0",right:"0",index:"0.002201",maxWeight:"4626"},
      {name:"42P",fwd:"1980.1",aft:"2069.0",left:"0",right:"0",index:"0.002555",maxWeight:"4626"},
    ]},
    {id:"g20",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"41P",fwd:"1873.3",aft:"1971.3",left:"0",right:"0",index:"0.002214",maxWeight:"5103"},
      {name:"42P",fwd:"1972.7",aft:"2069.0",left:"0",right:"0",index:"0.002543",maxWeight:"5103"},
    ]},
    // LD11 (DQF/DQP/FQA) share the P bays with the pallets. The manual has
    // no station table of its own for them, so the operator asked for the
    // PMC row's stations and index — the bay is the same. The weight is the
    // LD11's own 2449 certification, not the bay ceiling the PMC gets.
    {id:"gl4",uldType:"LD11",iata:"DQF",label:"LD11 — DQF/DQP/FQA",positions:[
      {name:"41P",fwd:"1873.3",aft:"1971.3",left:"0",right:"0",index:"0.002214",maxWeight:"2449"},
      {name:"42P",fwd:"1972.7",aft:"2069.0",left:"0",right:"0",index:"0.002543",maxWeight:"2449"},
    ]},
  ]},
  ]
  ,
  // Bulk holds: loose (non-ULD) cargo, one static "layout" per hold — no
  // combinatorial positions, no L/R, no certified ULD types. Shown in the
  // aircraft diagram and included in the export as their own rows, but not
  // fed through generateLayouts(). The joint hold max (CPT 5: 4082kg, less
  // than 51+52's 4477kg) is intentionally not enforced here — the operator's
  // own system computes the per-hold maximum downstream.
  bulk:[
    {number:5, positions:[
      {name:"51", fwd:"2069.5", aft:"2150.0", index:"0.002808", volume:"6.23",  maxWeight:"1701"},
      {name:"52", fwd:"2150.0", aft:"2220.0", index:"0.003087", volume:"10.76", maxWeight:"2776"},
    ]}
  ]
};

var TPL_B767_300ER = {
  name:"Boeing 767-300ER", refStation:"972.6",
  ulds:[
    {id:"u1",uldType:"LD2",    iata:"DPE",maxWeight:1224,tare:92},
    {id:"u2",uldType:"LD11",   iata:"DQF",maxWeight:2449,tare:120},
    {id:"u3",uldType:"LD11",   iata:"DQP",maxWeight:2449,tare:100},
    {id:"u4",uldType:"LD3",    iata:"AKC",maxWeight:1587,tare:75},
    {id:"u5",uldType:"LD3",    iata:"AKE",maxWeight:1587,tare:70},
    {id:"u6",uldType:"LD7/P88",iata:"PAG",maxWeight:5102,tare:105},
    {id:"u7",uldType:"LD7/P96",iata:"PMC",maxWeight:5102,tare:120},
    {id:"u8",uldType:"PLA",    iata:"PLA",maxWeight:3175,tare:83},
    {id:"u9",uldType:"LD11",   iata:"ALP",maxWeight:2449,tare:120},
  ],
  compartments:[
  {id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"11P",fwd:"235.8",aft:"361.1",left:"0",right:"0",index:"-0.004954",maxWeight:"5102"},
      {name:"12P",fwd:"364.3",aft:"487.7",left:"0",right:"0",index:"-0.004009",maxWeight:"5102"},
    ]},
    {id:"g2",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"11P",fwd:"235.8",aft:"361.1",left:"0",right:"0",index:"-0.004954",maxWeight:"5102"},
      {name:"12P",fwd:"364.3",aft:"487.7",left:"0",right:"0",index:"-0.004009",maxWeight:"5102"},
    ]},
    {id:"g3",uldType:"LD2",iata:"DPE",label:"LD2 — DPE",positions:[
      {name:"11L",fwd:"235.8",aft:"296.5",left:"0", right:"50",index:"-0.005182",maxWeight:"1224"},
      {name:"11R",fwd:"235.8",aft:"296.5",left:"50",right:"0", index:"-0.005182",maxWeight:"1224"},
      {name:"12L",fwd:"296.5",aft:"361.1",left:"0", right:"50",index:"-0.004716",maxWeight:"1224"},
      {name:"12R",fwd:"296.5",aft:"361.1",left:"50",right:"0", index:"-0.004716",maxWeight:"1224"},
      {name:"13L",fwd:"362.6",aft:"426.1",left:"0", right:"50",index:"-0.004242",maxWeight:"1224"},
      {name:"13R",fwd:"362.6",aft:"426.1",left:"50",right:"0", index:"-0.004242",maxWeight:"1224"},
      {name:"14L",fwd:"426.1",aft:"487.7",left:"0", right:"50",index:"-0.003730",maxWeight:"1224"},
      {name:"14R",fwd:"426.1",aft:"487.7",left:"50",right:"0", index:"-0.003730",maxWeight:"1224"},
    ]},
    {id:"g4",uldType:"PLA",iata:"PLA",label:"PLA — PLA",positions:[
      {name:"11",fwd:"235.8",aft:"296.5",left:"0",right:"0",index:"-0.005182",maxWeight:"3175"},
      {name:"12",fwd:"296.5",aft:"361.1",left:"0",right:"0",index:"-0.004716",maxWeight:"3175"},
      {name:"13",fwd:"362.6",aft:"426.1",left:"0",right:"0",index:"-0.004242",maxWeight:"3175"},
      {name:"14",fwd:"426.1",aft:"487.7",left:"0",right:"0",index:"-0.003730",maxWeight:"3175"},
    ]},
    {id:"g5",uldType:"LD11",iata:"DQF",label:"LD11 — DQF",positions:[
      {name:"11",fwd:"235.8",aft:"296.5",left:"0",right:"0",index:"-0.005182",maxWeight:"2449"},
      {name:"12",fwd:"296.5",aft:"361.1",left:"0",right:"0",index:"-0.004716",maxWeight:"2449"},
      {name:"13",fwd:"362.6",aft:"426.1",left:"0",right:"0",index:"-0.004242",maxWeight:"2449"},
      {name:"14",fwd:"426.1",aft:"487.7",left:"0",right:"0",index:"-0.003730",maxWeight:"2449"},
    ]},
    {id:"g6",uldType:"LD3",iata:"AKC",label:"LD3 — AKC",positions:[
      {name:"11",fwd:"235.8",aft:"296.5",left:"0",right:"35",index:"-0.005182",maxWeight:"1587"},
      {name:"12",fwd:"296.5",aft:"361.1",left:"0",right:"35",index:"-0.004716",maxWeight:"1587"},
      {name:"13",fwd:"362.6",aft:"426.1",left:"0",right:"35",index:"-0.004242",maxWeight:"1587"},
      {name:"14",fwd:"426.1",aft:"487.7",left:"0",right:"35",index:"-0.003730",maxWeight:"1587"},
    ]},
  ]},
  {id:"c2",number:2,uldGroups:[
    {id:"g7",uldType:"LD7/P88",iata:"PAG",label:"LD7/P88 — PAG",positions:[
      {name:"21P",fwd:"490.5",aft:"615.7",left:"0",right:"0",index:"-0.003082",maxWeight:"5102"},
      {name:"22P",fwd:"616.5",aft:"741.7",left:"0",right:"0",index:"-0.002156",maxWeight:"5102"},
    ]},
    {id:"g8",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      {name:"21P",fwd:"490.5",aft:"615.7",left:"0",right:"0",index:"-0.003082",maxWeight:"5102"},
      {name:"22P",fwd:"616.5",aft:"741.7",left:"0",right:"0",index:"-0.002156",maxWeight:"5102"},
    ]},
    {id:"g9",uldType:"PLA",iata:"PLA",label:"PLA — PLA",positions:[
      {name:"21",fwd:"490.5",aft:"555",  left:"0",right:"0",index:"-0.003278",maxWeight:"3175"},
      {name:"22",fwd:"555",  aft:"615.7",left:"0",right:"0",index:"-0.002826",maxWeight:"3175"},
      {name:"23",fwd:"616.5",aft:"681",  left:"0",right:"0",index:"-0.002374",maxWeight:"3175"},
      {name:"24",fwd:"681",  aft:"741.7",left:"0",right:"0",index:"-0.001922",maxWeight:"3175"},
    ]},
    {id:"g10",uldType:"LD2",iata:"DPE",label:"LD2 — DPE",positions:[
      {name:"21L",fwd:"490.5",aft:"555",  left:"0", right:"50",index:"-0.003278",maxWeight:"1224"},
      {name:"21R",fwd:"490.5",aft:"555",  left:"50",right:"0", index:"-0.003278",maxWeight:"1224"},
      {name:"22L",fwd:"555",  aft:"615.7",left:"0", right:"50",index:"-0.002826",maxWeight:"1224"},
      {name:"22R",fwd:"555",  aft:"615.7",left:"50",right:"0", index:"-0.002826",maxWeight:"1224"},
      {name:"23L",fwd:"616.5",aft:"681",  left:"0", right:"50",index:"-0.002374",maxWeight:"1224"},
      {name:"23R",fwd:"616.5",aft:"681",  left:"50",right:"0", index:"-0.002374",maxWeight:"1224"},
      {name:"24L",fwd:"681",  aft:"741.7",left:"0", right:"50",index:"-0.001922",maxWeight:"1224"},
      {name:"24R",fwd:"681",  aft:"741.7",left:"50",right:"0", index:"-0.001922",maxWeight:"1224"},
    ]},
    {id:"g11",uldType:"LD11",iata:"DQF",label:"LD11 — DQF",positions:[
      {name:"21",fwd:"490.5",aft:"555",  left:"0",right:"0",index:"-0.003278",maxWeight:"2449"},
      {name:"22",fwd:"555",  aft:"615.7",left:"0",right:"0",index:"-0.002826",maxWeight:"2449"},
      {name:"23",fwd:"616.5",aft:"681",  left:"0",right:"0",index:"-0.002374",maxWeight:"2449"},
      {name:"24",fwd:"681",  aft:"741.7",left:"0",right:"0",index:"-0.001922",maxWeight:"2449"},
    ]},
    {id:"g12",uldType:"LD3",iata:"AKC",label:"LD3 — AKC",positions:[
      {name:"21",fwd:"490.5",aft:"555",  left:"0",right:"35",index:"-0.003278",maxWeight:"1587"},
      {name:"22",fwd:"555",  aft:"615.7",left:"0",right:"35",index:"-0.002826",maxWeight:"1587"},
      {name:"23",fwd:"616.5",aft:"681",  left:"0",right:"35",index:"-0.002374",maxWeight:"1587"},
      {name:"24",fwd:"681",  aft:"741.7",left:"0",right:"35",index:"-0.001922",maxWeight:"1587"},
    ]},
  ]},
  {id:"c3",number:3,uldGroups:[
    {id:"g13",uldType:"LD2",iata:"DPE",label:"LD2 — DPE",positions:[
      {name:"31L",fwd:"1104",aft:"1165",left:"0", right:"50",index:"0.001190",maxWeight:"1224"},
      {name:"31R",fwd:"1104",aft:"1165",left:"50",right:"0", index:"0.001190",maxWeight:"1224"},
      {name:"32L",fwd:"1165",aft:"1226",left:"0", right:"50",index:"0.001635",maxWeight:"1224"},
      {name:"32R",fwd:"1165",aft:"1226",left:"50",right:"0", index:"0.001635",maxWeight:"1224"},
      {name:"33L",fwd:"1226",aft:"1286",left:"0", right:"50",index:"0.002081",maxWeight:"1224"},
      {name:"33R",fwd:"1226",aft:"1286",left:"50",right:"0", index:"0.002081",maxWeight:"1224"},
      {name:"34L",fwd:"1286",aft:"1347",left:"0", right:"50",index:"0.002526",maxWeight:"1224"},
      {name:"34R",fwd:"1286",aft:"1347",left:"50",right:"0", index:"0.002526",maxWeight:"1224"},
    ]},
    {id:"g14",uldType:"LD11",iata:"DQF",label:"LD11 — DQF",positions:[
      {name:"31",fwd:"1104",aft:"1165",left:"0",right:"0",index:"0.001190",maxWeight:"2449"},
      {name:"32",fwd:"1165",aft:"1226",left:"0",right:"0",index:"0.001635",maxWeight:"2449"},
      {name:"33",fwd:"1226",aft:"1286",left:"0",right:"0",index:"0.002081",maxWeight:"2449"},
      {name:"34",fwd:"1286",aft:"1347",left:"0",right:"0",index:"0.002526",maxWeight:"2449"},
    ]},
    {id:"g15",uldType:"PLA",iata:"PLA",label:"PLA — PLA",positions:[
      {name:"31",fwd:"1104",aft:"1165",left:"0",right:"0",index:"0.001190",maxWeight:"3175"},
      {name:"32",fwd:"1165",aft:"1226",left:"0",right:"0",index:"0.001635",maxWeight:"3175"},
      {name:"33",fwd:"1226",aft:"1286",left:"0",right:"0",index:"0.002081",maxWeight:"3175"},
      {name:"34",fwd:"1286",aft:"1347",left:"0",right:"0",index:"0.002526",maxWeight:"3175"},
    ]},
    {id:"g16",uldType:"LD3",iata:"AKC",label:"LD3 — AKC",positions:[
      {name:"31",fwd:"1104",aft:"1165",left:"0",right:"35",index:"0.001190",maxWeight:"1587"},
      {name:"32",fwd:"1165",aft:"1226",left:"0",right:"35",index:"0.001635",maxWeight:"1587"},
      {name:"33",fwd:"1226",aft:"1286",left:"0",right:"35",index:"0.002081",maxWeight:"1587"},
      {name:"34",fwd:"1286",aft:"1347",left:"0",right:"5", index:"0.002526",maxWeight:"1587"},
    ]},
  ]},
  {id:"c4",number:4,uldGroups:[
    {id:"g17",uldType:"LD2",iata:"DPE",label:"LD2 — DPE",positions:[
      {name:"41L",fwd:"1347",aft:"1407",left:"0", right:"50",index:"0.002972",maxWeight:"1224"},
      {name:"41R",fwd:"1347",aft:"1407",left:"50",right:"0", index:"0.002972",maxWeight:"1224"},
      {name:"42L",fwd:"1409",aft:"1471",left:"0", right:"50",index:"0.003434",maxWeight:"1224"},
      {name:"42R",fwd:"1409",aft:"1471",left:"50",right:"0", index:"0.003434",maxWeight:"1224"},
      {name:"43L",fwd:"1473",aft:"1534",left:"0", right:"50",index:"0.003902",maxWeight:"1224"},
      {name:"43R",fwd:"1473",aft:"1534",left:"50",right:"0", index:"0.003902",maxWeight:"1224"},
    ]},
    {id:"g18",uldType:"PLA",iata:"PLA",label:"PLA — PLA",positions:[
      {name:"41",fwd:"1347",aft:"1407",left:"0",right:"0",index:"0.002972",maxWeight:"3175"},
      {name:"42",fwd:"1409",aft:"1471",left:"0",right:"0",index:"0.003434",maxWeight:"3175"},
      {name:"43",fwd:"1473",aft:"1534",left:"0",right:"0",index:"0.003902",maxWeight:"3175"},
    ]},
    {id:"g19",uldType:"LD11",iata:"DQF",label:"LD11 — DQF",positions:[
      {name:"41",fwd:"1347",aft:"1407",left:"0",right:"0",index:"0.002972",maxWeight:"2449"},
      {name:"42",fwd:"1409",aft:"1471",left:"0",right:"0",index:"0.003434",maxWeight:"2449"},
      {name:"43",fwd:"1473",aft:"1534",left:"0",right:"0",index:"0.003902",maxWeight:"2449"},
    ]},
    {id:"g20",uldType:"LD3",iata:"AKC",label:"LD3 — AKC",positions:[
      {name:"41",fwd:"1347",aft:"1407",left:"0",right:"0",index:"0.002972",maxWeight:"1587"},
      {name:"42",fwd:"1409",aft:"1471",left:"0",right:"0",index:"0.003434",maxWeight:"1587"},
      {name:"43",fwd:"1473",aft:"1534",left:"0",right:"0",index:"0.003902",maxWeight:"1587"},
    ]},
  ]},
  ],
  bulk:[],
};

var TEMPLATES = [TPL_B787, TPL_A330, TPL_B777, TPL_A330_200, TPL_B777_300, TPL_B767_300ER];
