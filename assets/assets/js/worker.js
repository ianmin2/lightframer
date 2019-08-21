importScripts("jspdf.min.js");

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
    case 'generatePDF':
      workerResult = generatePDF(
        data[2]
      );
      break;
  }

  self.postMessage(JSON.stringify(
    [
      MESSAGE_ID,
      workerResult
    ]
  ));
}

// Private functions.
function generatePDF(vals) 
{
  
  alert(`Worker loaded!`);
  console.dir(vals)

  if (!vals) {
    return;
  }
  
    //@ Start  an instance of the pdf generator
    let doc = new jsPDF('l', 'pt');
    //@ Add a simple title
    doc.autoTable( vals.headers, vals.data, {
        styles: {fillColor: [100, 175, 250], fontSize: 5},
        columnStyles: {
            id: {fillColor: 255}
        },
        margin: {top: 60},
        addPageContent: function(data) {
            doc.text(`${vals.text}     at     ${new Date().format("yyyy/mm/dd HH:mm")}`, 40, 30);
        }
    });

    return doc;
}