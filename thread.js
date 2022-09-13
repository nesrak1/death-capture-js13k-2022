function createWorker(func, deps) {
    var blobParts = ["(",func.toString(),")()"];
    deps.forEach(d => {
        blobParts = [d.toString()].concat(blobParts);
    });
    var blobUrl = URL.createObjectURL(
        new Blob(blobParts, { type: "application/javascript" })
    );
    return new Worker(blobUrl);
}