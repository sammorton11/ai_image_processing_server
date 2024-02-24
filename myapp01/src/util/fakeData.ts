interface Issue {
   description: string;
   name: string;
   percent: string; // Assuming percent is kept as a string to maintain consistency with the provided data structure
}

interface Data {
   issues: Issue[];
   type: string;
}

const fakeData: Data = {
   "issues": [
      {
         "description": "Symptoms include reddish-blue spots on the leaves, with dark purple spots on the canes. The spots may grow in size and merge, leading to yellowing of the leaves and premature shedding. Anthracnose can also result in cracking and cankers on the canes. To combat anthracnose, it is recommended to prune and eliminate infected canes, and apply a suitable fungicide to the plants.",
         "name": "Anthracnose",
         "percent": "100.0"
      },
      {
         "description": "The tomato plant leaves have developed black spots, a prevalent issue attributable to a bacterial infection. The likeliest culprit is bacterial spot, caused by the bacterium Xanthomonas vesicatoria. Bacterial spot can manifest as black spots on leaves, stems, and fruit. Addressing this involves employing a copper-based bactericide or removing and destroying infected plant material.",
         "name": "Bacterial Spot",
         "percent": "75.0"
      },
      {
         "description": "The tomato plant leaves have developed brown spots, a prevalent issue attributable to a fungal infection. The likeliest culprit is Septoria leaf spot, caused by the fungus Septoria lycopersici. Septoria leaf spot can manifest as brown spots on leaves, which can eventually lead to defoliation. Addressing this involves employing a fungicide or removing and destroying infected plant material.",
         "name": "Septoria Leaf Spot",
         "percent": "25.0"
      }
   ],
   "type": "Gooseberry"
};

export default fakeData; 
