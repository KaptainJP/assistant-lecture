/**
 * le principe de ce plugins est d'aller chercher un texte à lire en retour d'un WS défini dans le fichier de config
 * ce WS retourne un body json contenant 2 rubriques : Erreur et ReponseALire
 * Si Erreur est > 0 => pas de texte à lire 
 * Si Erreur = 0 => lecture du texte contenu dans ReponseALire
 *
 *
 * "plugins": {
 *   "Lecture": {
 *     "url":"http://www.truc.fr/webservice/trucalire.php"
 *   }
 * }
 *
 * le retour json du WS
 * {
 *	"Erreur":0,
 *	"ReponseALire":"Ceci est le texte qui sera lu par Google Home"
 * }
 *
 *
 */
 
var request = require('request-promise-native');

/**
 * on crée une fonction `AssistantLecture`
 * @param {Object} configuration L'objet `configuration` qui vient du fichier configuration.json
 */
var AssistantLecture = function(configuration) {
this.url = configuration.url;
}

/**
 * Init le plugin
 *
 * @param  {Object} plugins Un objet représentant les autres plugins chargés
 * @return {Promise}
 */
AssistantLecture.prototype.init = function(plugins) {
  this.plugins = plugins;
  return Promise.resolve(this);
};

/**
 * Fonction appelée par le système central
 *
 * @param {String} commande La commande envoyée depuis IFTTT par Pushbullet
 * @return {Promise}
 */
AssistantLecture.prototype.action = function(commande) {
  // la commande va ressembler à http://www.truc.fr/webservice/trucalire.php
  var _this=this;
  commande = '"'+commande.replace(/'/g,'\\"').replace(/, /g,",")+'"';
  commande = JSON.parse(commande);
  if (typeof commande==="string") commande = JSON.parse(commande);
  return request({
    'url' : _this.url  })
  .then(function(response){
    if (response) {
      var body = JSON.parse(response);
	  var lerc = body.Erreur;
	  if (lerc > 0) return _this.plugins.notifier.action("Je n'ai pas d'information pour le moment");
	  else {
		  var speak = body.ReponseALire;
		  if (_this.plugins.notifier) return _this.plugins.notifier.action(speak);
		  else {
			console.log("[Assistant-Lecture] ATTENTION: Le plugin 'notifier' n'a pas été installé... le résultat de cette action ne peut donc pas être diffusé sur un appareil et sera seulement inscrit dans cette fenêtre.");
		  }
		console.log("[Assistant-Lecture] "+speak);
	  }
      console.log("[Assistant-Lecture] erreur WS : "+lerc);
    } else {
      console.log("[Assistant-Lecture] Erreur lors de l'accès à la ressource...");
      if (_this.plugins.notifier) return _this.plugins.notifier.action("L'action a échoué...");
    }
  })
  .catch(function(err) {
    console.log("[Assistant-Lecture] Erreur => ",err)
  })
};

/**
 * Initialisation du plugin
 *
 * @param  {Object} configuration La configuration
 * @param  {Object} plugins Un objet qui contient tous les plugins chargés
 * @return {Promise} resolve(this)
 */
exports.init=function(configuration, plugins) {
  return new AssistantLecture(configuration).init(plugins)
  .then(function(resource) {
    console.log("[Assistant-Lecture] Plugin chargé et prêt.");
    return resource;
  })
}