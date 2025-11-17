export default function getGraphOption(data){
    const processes = Object.keys(data['parsed']);
    const final = {processes}
    for ( process of processes ){
        final[process] = {};
        //number of available pallets , list of column names
        final[process] = [Object.keys(data['parsed'][process]).length, data['baseColumns'][process.replace(/_content$/, "")]];
    }

    return final; 
}