import controller from './../controller.js';
import _ from 'lodash';


export default new (class extends controller {
  async dashboard(req, res){
   res.send('admin dashboard')
  }


})();
   

