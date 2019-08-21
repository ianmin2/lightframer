
let self = this;

self.addEventListener('message', receiveMessage, false);

// Main.
function receiveMessage(message) {

  var data = JSON.parse(message.data),
    workerResult;
  const MESSAGE_ID = data[0];

  switch (data[1]) {

    // Web worker functions.
    case 'close':
      self.close();
    break;

    // Service functions.
    case 'generateCharts':
      workerResult = generateCharts(data[2]);
    break;

  }

  self.postMessage(JSON.stringify(
    [
      MESSAGE_ID,
      workerResult
    ]
  ));
}

function generateCharts(chartData)
{

  let obj = chartData.obj;
  let nom = chartData.nom;

  let charts = {}

  if(Array.isArray(obj) && obj[0] )
  {
      const enumerable_data = obj.filter(e=> ( e.sender && e.sender != 'null' && e.sender != null ) )

      charts[`${nom}`]  = { 
          data : [], 
          labels: [], 
          series: ['Delivered','Pending','Failed','Requeued'], 
          total: [], 
          requeue: [],
          total_series: ['Received'], 
          options: {
              colors: ['#FF0000', '#00FF00', '#0000FF', '#aaaaaa', '#00CCFF', '#FFCCFF', '#000000'],
              title: {
                          display: true,
                          text: nom.replace(/\_/ig, ' ').toUpperCase()
                      },
              legend: {
                  display: true,
                  position: 'bottom'
              }
          }
      };

      let d = {
          delivered: []
          ,pending: []
          ,failed: []
          ,requeued: []
      };

      enumerable_data
      .forEach( (v) => 
      {

          charts[`${nom}`].labels.push(`${v.sender} (${v['total_received']})`);
          d.delivered.push(v['total_delivered']);
          d.pending.push(v['total_pending']);
          d.failed.push(v['total_failed']);
          d.requeued.push(v['total_requeued']);
          charts[`${nom}`].requeue.push([ v['total_requeue_failed'], v['total_requeue_sent'] ]);
          charts[`${nom}`].total.push(v['total_received'])

      })

      charts[`${nom}`].data =(Array( d.delivered, d.pending, d.failed, d.requeued ))  

      return { title: nom, data: charts[`${nom}`] };

  }
  else
  {
     return undefined;
  }

}
