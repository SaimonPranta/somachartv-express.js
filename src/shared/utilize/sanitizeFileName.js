const sanitizeFileName = (fileName = "") => {
    // Allow alphanumeric, '.', '-', '_', and all Bangla characters
    return fileName.replace(/[^a-zA-Z0-9. _\-।\u0985-\u09B9\u09C0\u09C1\u09C2\u09C3\u09C4\u09C5\u09C6\u09C7\u09C8\u09C9\u09CA\u09CB\u09CC\u09CD\u09CE\u09D7\u09D8\u09D9\u09DA\u09DB\u09DC\u09DD\u09DE\u09DF\u09E0\u09E1\u09E2\u09E3]/g, '');
};


module.exports = sanitizeFileName