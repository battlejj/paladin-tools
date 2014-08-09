var abilityData = [];
var typeData = [];
for (var i in abilities) {

  // add browser data
  abilityData.push({
    name: i,
    y: abilities[i].total
    //color: data[i].color
  });

  // add version data
  for (var j in abilities[i]) {
    //var brightness = 0.2 - (j / data[i].drilldown.data.length) / 5 ;
    if(j != 'total') {
      typeData.push({
        name: i + ' - ' + j,
        y: abilities[i][j]
        //color: Highcharts.Color(data[i].color).brighten(brightness).get()
      });
    }
  }
}

// Create the chart
$('#donut').highcharts({
  chart: {
    type: 'pie'
  },
  title: {
    text: 'Damage Breakdown in fight'
  },
  yAxis: {
    title: {
      text: 'Total percent damage per ability'
    }
  },
  plotOptions: {
    pie: {
      shadow: false,
      center: ['50%', '50%']
    }
  },
  tooltip: {
    valueSuffix: ''
  },
  series: [{
    name: 'Abilities',
    data: abilityData,
    size: '70%',
    dataLabels: {
      formatter: function() {
        return this.y > 5 ? this.point.name : null;
      },
      //color: 'white',
      distance: 100
    }
  }, {
    name: 'Type',
    data: typeData,
    size: '100%',
    innerSize: '80%',
    dataLabels: {
      formatter: function() {
        // display only if larger than 1
      }
    }
  }]
});





