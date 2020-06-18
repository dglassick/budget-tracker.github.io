const indexedDB = window.indexedDB

let db;

// creating new database for the budget tracker app
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('transaction', {autoIncrement: true})
}

request.onsuccess = function (event){
    db = event.target.result;

    if(navigator.onine){
        checkDatabase()
    }
}

request.onerror = function (event){
    console.log('Error: ' + event.target.errorCode)
}

function saveTransaction (transactionRecord) {
    //creates transaction with readwrite
    const transaction = db.transaction(['transaction'], 'readwrite');

    //accesses your transaction object
    const save = transaction.objectStore('transaction');

    //adds record to your db
    save.add(transactionRecord)
}

function checkDatabase () {
    //opens the previous transactions to sore them in the db
    const transaction = db.transaction(['transaction'], 'readwrite');

    //accesses previous pending object

    const save = transaction.objectStore('transaction');

    //gets all records from variable
    const getAllTransactions = save.getAllTransactions()

    getAllTransactions.onsuccess = function (){

        if (getAllTransactions.result.length > 0){
            fetch('api/transaction', {
                method: "POST",
                body: JSON.stringify(getAllTransactions.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type":"application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // if seccussful open the transaction that was pending in the db
                const transaction = db.transaction(['transaction'], 'readwrite');

                // access the pending object to store
                const save = transaction.objectStore('transaction')

                // clears all items in save
                save.clear()
            })
        }
    }
}

window.addEventListener("online", checkDatabase);