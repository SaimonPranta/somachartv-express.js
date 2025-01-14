const getFullDate = (dateString = new Date()) => {
    const date = (dateString)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12) || 12; // Convert 0 to 12 for midnight
  
    return `${day}-${month}-${year} || ${hours}:${minutes} ${ampm}`;
}


module.exports = {getFullDate}