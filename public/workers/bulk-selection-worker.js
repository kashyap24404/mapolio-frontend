// Web Worker for handling bulk selection operations
self.onmessage = function(e) {
  const { type, getAllPathsAtLevel } = e.data;
  
  try {
    let result;
    switch (type) {
      case 'select-all':
        result = getAllPathsAtLevel(3);
        break;
      case 'states-only':
        result = getAllPathsAtLevel(0);
        break;
      case 'counties-only':
        result = getAllPathsAtLevel(1);
        break;
      case 'cities-only':
        result = getAllPathsAtLevel(2);
        break;
      case 'zips-only':
        result = getAllPathsAtLevel(3);
        break;
      case 'clear-all':
        result = [];
        break;
      default:
        result = [];
    }
    
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};