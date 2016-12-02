angular.module('app.controllers', [])



.controller('loginCtrl', function ($scope, $http, $state, $localStorage, $rootScope,$ionicHistory, $q ) {

	$scope.dato = {};
	$scope.info = {};
	$rootScope.token = '';
	$scope.dato.email = '';
	$scope.dato.password = '';
	$rootScope.url_orchid = $localStorage.hostname;
	

	$scope.setting = function(){$state.go('menu.setting');}

	$scope.login = function () {

		$http({
			method : 'POST',
			url : 'http://' + $localStorage.hostname + '/user/login/',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'X-Requested-With' : 'XMLHttpRequest'
			},
			transformRequest : function (obj) {
				var str = [];
				for (var p in obj)
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			},
			data : {
				email : $scope.dato.email,
				password : $scope.dato.password
			}
		}).success(function (data, status, headers, config) {
			if (data.status == "failure") {
				alert("User or Password incorrect, try Again.......");
				$scope.dato.email = '';
				$scope.dato.password = '';
			} else {
			$rootScope.user_id = data.userid;
			$rootScope.token = data.sessionid;
			$ionicHistory.nextViewOptions({ disableBack: true, historyRoot: false });
			$state.go('synchronized');
			}
		}).error(function (data, status, headers, config) {
			alert("Ha fallado la petición. Estado HTTP: " + status);
		});
	}
	
	
	
	
})


.controller('synchronizedCtrl', function ($scope, $http, $state, $localStorage, $rootScope, $q, $ionicLoading) {

	var sync_url = $localStorage.hostname;
	
	delete $localStorage.discolocations;
	delete $localStorage.discoindicators;
	delete $localStorage.discovisualizes;
	$localStorage.discolocations = [];
	$localStorage.discoindicators = [];
	$localStorage.discovisualizes = [];
	
	/* delete $localStorage.discolocations;
	delete $localStorage.discoindicators;
	delete $localStorage.discovisualizes; */
	
	/* $localStorage.disco_records = []; //de esta forma registros no enviados quedaran guardados en el dispositivo. */
	$localStorage.disco_scores = [];

	var lista = [];

	function localidades() {

		var defered = $q.defer();
		var promise = defered.promise;

		$http({
			method : 'GET',
			url : 'http://' + sync_url + '/location/list/'+'?hash_id=' + Math.random(),
			cache : 'false',
			headers : {
				'X-Requested-With' : 'XMLHttpRequest',
				'Cookie' : 'sessionid=' + $rootScope.token
			},
			data : {
				userid  : $rootScope.user_id,
				sessionid : $rootScope.token
			}
		}).then(function (response) {
			defered.resolve(response);
		}, function (response) {
			defered.resolve(response);
		});
		return promise;
	};

	var promise = localidades();

	function indicadores() {
		var defered = $q.defer();
		var promise = defered.promise;

		$http({
			method : 'GET',
			url : 'http://' + sync_url + '/indicator/list/'+'?hash_id=' + Math.random(),
			cache : 'false',
			headers : {
				'X-Requested-With' : 'XMLHttpRequest',
				'Cookie' : 'sessionid=' + $rootScope.token
			}
		}).then(function (response) {
			defered.resolve(response);
		}, function (response) {
			defered.resolve(response);
		});
		return promise;
	};

	var promise1 = indicadores();

	function vis(param) {
		var defered = $q.defer();
		var promise = defered.promise;

		$http({
			method : 'GET',
			url : 'http://' + sync_url + '/location/' + param + '/visualize/'+'?hash_id=' + Math.random(),
			cache : 'false',
			headers : {
				'X-Requested-With' : 'XMLHttpRequest',
				'Cookie' : 'sessionid=' + $rootScope.token
			}
		}).then(function (response) {
			defered.resolve(response);
		}, function (response) {
			defered.resolve(response);
		});

		return promise;
	};

	function vista() {
		var promesa;
		for (x in $scope.locations) {
			promesa = vis($scope.locations[x].id);
			lista.push(promesa);
		};
	};

	$q.all([promise, promise1]).then(function (response) {
		$scope.locations = response[0].data.locations;
		$scope.indicators = response[1].data.indicators;
		for (x in $scope.locations)
			$localStorage.discolocations.push($scope.locations[x]);
		for (x in $scope.indicators)
			$localStorage.discoindicators.push($scope.indicators[x]);
		vista();
		$q.all(lista).then(function (response) {
			for (i = 0; i < lista.length; i++) {
				$scope.visualize = response[i].data;
				/* alert(JSON.stringify(eval(response[i].data.location_id))); */
				$localStorage.discovisualizes.push($scope.visualize);
			};
			$state.go('menu.chooseLocation');
		});
	});

})
.controller('settingCtrl', function ($scope, $localStorage, $rootScope, $state) {

	$scope.guardar = function (dato) {
		$localStorage.hostname = dato;
	}

	$scope.leer = function () {

		return $localStorage.hostname;

	}

	$scope.borrar = function () {
		delete $localStorage.hostname;
	}

	$scope.retorno = function(){$state.go('login');}

})

.controller('chooseLocationCtrl', function ($scope, $localStorage, $state, $rootScope, $cordovaGeolocation,$haversine) {
	$rootScope.indicadores = [];
	$scope.locations = $localStorage.discolocations
	$scope.indicators = $localStorage.discoindicators;
	$scope.test = function (enviado) {
		$rootScope.indicadores = enviado.indicator_ids;
		$rootScope.localidad = enviado.title;
		$rootScope.localidad_id = enviado.id;
		$state.go('menu.selectedIndicador');
	};
	$scope.geolocalizar = function(){
		$cordovaGeolocation.getCurrentPosition().then(function (position) {
		    

		  
		  if($scope.locations.length>0){
			var coord1 = {
 						 "latitude": $scope.locations[0].lattitude,
 						 "longitude": $scope.locations[0].longitude
						};
 
			var coord2 = {
 						 "latitude": position.coords.latitude,
 						 "longitude": position.coords.longitude
						};  
			  
		    var distancia = $haversine.distance(coord1, coord2);;
		    var lugar = 0;
		  } else { alert("No Locations......")}
		  
		  for(i = 0;i<$scope.locations.length;i++){
			coord1 = {
 						 "latitude": $scope.locations[i].lattitude,
 						 "longitude": $scope.locations[i].longitude
						};
 
			coord2 = {
 						 "latitude": position.coords.latitude,
 						 "longitude": position.coords.longitude
						};

			var distance = $haversine.distance(coord1, coord2);
			if(distance<distancia){
				distancia = distance;
				lugar = i;
			}
		}	

		$scope.test($scope.locations[lugar]);	
    }, function(err) {
		alert(err);
    });
	};

	

})

.controller('allLocationOutBoxCtrl', function ($scope,$localStorage,$http,$state,$rootScope,$q, $ionicHistory) {


// Preparndo informción a enviar

var RECORDS_temporal = [];
var SCORES_temporales = [];
var RECORDS_A_ENVIAR = [];
var fecha_global = $rootScope.fecha_trans;
var sync_url = $localStorage.hostname;
var lista_de_registros_promesa = [];
$scope.lista_scores = [];


 for(i=0;i<$localStorage.disco_records.length;i++)
	if($localStorage.disco_records[i].scored)
	 RECORDS_A_ENVIAR.push($localStorage.disco_records[i]);
	else
	 RECORDS_temporal.push($localStorage.disco_records[i]);

 $scope.lista_de_registros = RECORDS_A_ENVIAR.slice(0);

 $localStorage.disco_records = []  // inicialiazando almacenamiento de records

// Agregando a almacenamiento registros que no seran enviados
 for(i=0;i<RECORDS_temporal.length;i++)
	$localStorage.disco_records.push(RECORDS_temporal[i]);

// despliega lista de scores
$scope.lista_scores = $localStorage.disco_scores.slice(0);
//alert(JSON.stringify(eval($scope.lista_scores)));
 $scope.procesos = function () {
	// Inicia codigo de envio de RECORS
						// Filtrado de los records por fecha

						for (j = 0;j<$scope.lista_de_registros.length;j++){
								if (($scope.lista_de_registros[j].month == fecha_global.fecha.getMonth()+1) && ($scope.lista_de_registros[j].year == fecha_global.fecha.getFullYear())){
								// mecanismo de envio de un objeto RECORD como un string
								function registros() {

										var defered = $q.defer();
										var promise = defered.promise;

										$http({
												method : 'POST',
												url : 'http://' + sync_url + '/location/' + $scope.lista_de_registros[j].location_id + '/indicator/' + $scope.lista_de_registros[j].indicator_id + '/record/upload/',
												headers: {
															'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
															'X-Requested-With' : 'XMLHttpRequest'
										},
										transformRequest: function(data) {

												var param = function(obj) {
												var query = '';
												var name, value, fullSubName, subValue, innerObj, i;

												for(name in obj) {
												value = obj[name];

												if(value instanceof Array) {
													for(i=0; i<value.length; ++i) {
													subValue = value[i];
													fullSubName = name + '[' + i + ']';
													innerObj = {};
													innerObj[fullSubName] = subValue;
													query += param(innerObj) + '&';
													}
												} else if(value instanceof Object) {
													for(subName in value) {
													subValue = value[subName];
													fullSubName = name + '[' + subName + ']';
													innerObj = {};
													innerObj[fullSubName] = subValue;
													query += param(innerObj) + '&';
													}
												} else if(value !== undefined && value !== null) {
													query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
												}
												}

												return query.length ? query.substr(0, query.length - 1) : query;
												};

												return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
										},
										data : {json : JSON.stringify(eval($scope.lista_de_registros[j]))}
													}).then(function (response) {
														defered.resolve(response);
													}, function (response) {
														defered.resolve(response);
													});
														return promise;
								};
								promesa1 = registros();
								lista_de_registros_promesa.push(promesa1);

							} // fin if

						}	// fin for

						/* $q.all(lista_de_registros_promesa).then(function (response) {
										alert("Mensaje recibido despues de enviar RECORD..."+ JSON.stringify(eval(response[0].data)));
										$scope.lista_de_registros = [];
								}); */

						// Filtramos por fecha  y creamos el objeto json_SCORE para envio de scores segun django
						// Luego eniamos el objeto SCORE como un string
				/*		for (j = 0;j<$localStorage.disco_scores.length;j++){
								if (($localStorage.disco_scores[j].month == fecha_global.fecha.getMonth()+1) && ($localStorage.disco_scores[j].year == fecha_global.fecha.getFullYear()))
								{
										json_score.scores.push($localStorage.disco_scores[j]);
									    delete $localStorage.disco_scores[j];
								}
						} */


							// mecanismo de envio de un SCORES
								function scores() {

										var defered = $q.defer();
										var promise = defered.promise;

										$http({

												method : 'POST',
												url : 'http://' + sync_url + '/location/' + $rootScope.localidad_id + '/score/upload/',
												headers: {
															'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
															'X-Requested-With' : 'XMLHttpRequest'
										},
										transformRequest: function(data) {

												var param = function(obj) {
												var query = '';
												var name, value, fullSubName, subValue, innerObj, i;

												for(name in obj) {
												value = obj[name];

												if(value instanceof Array) {
													for(i=0; i<value.length; ++i) {
													subValue = value[i];
													fullSubName = name + '[' + i + ']';
													innerObj = {};
													innerObj[fullSubName] = subValue;
													query += param(innerObj) + '&';
													}
												} else if(value instanceof Object) {
													for(subName in value) {
													subValue = value[subName];
													fullSubName = name + '[' + subName + ']';
													innerObj = {};
													innerObj[fullSubName] = subValue;
													query += param(innerObj) + '&';
													}
												} else if(value !== undefined && value !== null) {
													query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
												}
												}

												return query.length ? query.substr(0, query.length - 1) : query;
												};

												return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
										},
										data : {json : JSON.stringify(eval($scope.lista_scores[0]))}
													}).then(function (response) {
														defered.resolve(response);
													}, function (response) {
														defered.resolve(response);
													});
														return promise;
								};

								promesa2 = scores();
								$q.all([lista_de_registros_promesa,promesa2]).then(function (response) {
										$scope.lista_scores = [];
										$scope.lista_de_registros = [];
										alert("Data Synchronization completed ...");
										$ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true });
										$state.go('synchronized');
								});
						};	// fin de procesos


})

.controller('selectedIndicadorCtrl', function ($scope, $localStorage, $state, $rootScope) {
	indicadores = $rootScope.indicadores;
	lista_indicadores = $localStorage.discoindicators;
	$scope.muestra_indicadores = [];
	for (i = 0; i < indicadores.length; i++)
		for (j = 0; j < lista_indicadores.length; j++)
			if (lista_indicadores[j].id == indicadores[i])
				$scope.muestra_indicadores.push(lista_indicadores[j]);
    $rootScope.envia_indicadores = $scope.muestra_indicadores;
	$scope.test = function (enviado) {
		$rootScope.survey = enviado;
		$state.go('survey');
	};
	
	
})

.controller('draftsCtrl', function ($scope,$localStorage,$state, $rootScope) {
	
	$scope.localidad = $rootScope.localidad;
	 $scope.muestra_draft_records = [];
	 registros = $localStorage.disco_records;
	 for(i = 0 ; i < registros.length ; i++){
		if ( !registros[i].scored && registros[i].location_id == $rootScope.localidad_id )
			$scope.muestra_draft_records.push(registros[i]);
	 }
	 
	 $scope.test = function (enviado) {
		 
		var indice = $localStorage.disco_records.indexOf(enviado);
		var localidad = enviado.location_id;
		var indicador = enviado.indicator_id;
		lista_indicadores = $localStorage.discoindicators;
		for(i = 0 ; i < lista_indicadores.length ; i++){
			if( lista_indicadores[i].id == indicador ){
				$rootScope.indicadoresedit = lista_indicadores[i].fields;
				}
		}
		
		$rootScope.surveyEditResp = enviado;
		$localStorage.disco_records.splice(indice,1);
		$state.go('surveyEdit'); 
	};


})

.controller('graphicCtrl', function ($scope,$localStorage,$rootScope,$state) {
  var meses = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  $localStorage.discovisualizes;
  $rootScope.localidad_id;
  $scope.series = [];
  $scope.data = [];
  var suma = 0;
  var objeto_a_graficar = {};

  for(i=0;i<$localStorage.discovisualizes.length;i++)
	  if($localStorage.discovisualizes[i].location_id == $rootScope.localidad_id )
			objeto_a_graficar = $localStorage.discovisualizes[i];

  for(i=0;i<objeto_a_graficar.series.length;i++)
    $scope.series.push(objeto_a_graficar.series[i].name);



  for(i=0;i<objeto_a_graficar.series.length-1;i++){
	 var arreglo = [0,0,0,0,0,0,0,0,0,0,0,0];
	 suma = 0;
	 for(j=0;j<objeto_a_graficar.series[i].data.length;j++)
		  for(k=0;k<meses.length;k++)
			if(objeto_a_graficar.series[i].data[j][3] == meses[k] )
				arreglo[k] = objeto_a_graficar.series[i].data[j][1];

	 for(x=0;x<arreglo.length;x++)
			suma += arreglo[x];
	     $scope.data.push(arreglo);
  }

	var arreglo = [0,0,0,0,0,0,0,0,0,0,0,0];
	for(i=0;i<objeto_a_graficar.series[objeto_a_graficar.series.length-1].data.length;i++)
	          arreglo[i] = objeto_a_graficar.series[objeto_a_graficar.series.length-1].data[i][1];

	$scope.data.push(arreglo);

	$scope.onClick = function (points, evt) {
    console.log(points, evt);
	};
  $scope.labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  /* $scope.series = ['Series A', 'Series B']; */
  /* $scope.data = [
    [65, -1, 80, 81, -1, 55, 40],
    [28, 48, -1, 19, -1, 27, 90]
  ]; */
})

.controller('scoreCtrl', function ($scope,$rootScope,$localStorage,$state,$ionicPopup,$ionicHistory) {
	/* $rootScope.localidad;
	$rootScope.localidad_id; */
	$scope.localidad = $rootScope.localidad;
	$scope.porciento_total = 0;
	$scope.lista_indicadores_porcentaje = [];
	var suma_porciento = 0;
	var indicadores_validos = 0;
	var sync_url = $localStorage.hostname;
	var total_record_count = 0;
	var passing_record_count = 0;
	var json_score = {
						'title' : '(SCORE)',
						'titulo_localidad' : '',
						'timestamp' : 0,
						'scores' : []
					};
	var obj_score = {
					'titulo' : '',
					'percentage' : 0,
					'location_id' : '',
					'indicator_id' : '',
					'total_record_count' : 0,
					'passing_record_count' : 0,
					'passing' : true,
					'month' : 0,
					'year' : 0
				};


	 function mes_ano() {
		$scope.data = {};

			// Popup a la medida
			var myPopup = $ionicPopup.show({
				template: ' Month/Year : <input type="month" ng-model="data.fecha">',
				title: 'Enter Month and Year',
				subTitle: 'Processing data you want to Score',
				scope: $scope,
				buttons: [
				{
				text: '<b>Define</b>',
				type: 'button-positive',
				onTap: function(e) {
					if (!$scope.data.fecha) {
					//el usuario tiene que ingresar fecha
						e.preventDefault();
					} else {
						return $scope.data;
					}
					}
				}
				]
		});
			myPopup.then(function(res) {


					fecha_global = res;
					$rootScope.fecha_trans = res;

					for(i = 0;i<$rootScope.envia_indicadores.length;i++){
						total_record_count = 0;
						passing_record_count = 0;

					   for (j = 0;j<$localStorage.disco_records.length;j++)
						 if ( $rootScope.envia_indicadores[i].id == $localStorage.disco_records[j].indicator_id  && (res.fecha.getMonth()+1 == $localStorage.disco_records[j].month)  && !($localStorage.disco_records[j].scored) ){

							// calcular cuantos record pasaron
							if($localStorage.disco_records[j].score >= $rootScope.envia_indicadores[i].passing_percentage )
							 passing_record_count++;
							// calcular cuantos record son para la fecha
							total_record_count++;
							/* $localStorage.disco_records[j].scored = true; */
						 }
						obj_score ={}; // nuevo objeto
						obj_score.titulo = $rootScope.envia_indicadores[i].title;
						if(total_record_count == 0)
							obj_score.percentage = 'NO DATA';
						else {
							obj_score.percentage = (passing_record_count/total_record_count)*100;
							suma_porciento += obj_score.percentage;
							indicadores_validos++;
						}
						obj_score.location_id = $rootScope.localidad_id;
						obj_score.indicator_id = $rootScope.envia_indicadores[i].id;
						obj_score.total_record_count = total_record_count;
						obj_score.passing_record_count = passing_record_count;
						obj_score.passing = false;
						if(!(obj_score.percentage == 'NO DATA'))
							if(obj_score.percentage >=  $rootScope.envia_indicadores[i].passing_percentage )
								obj_score.passing = true;
						obj_score.month = res.fecha.getMonth()+1;
						obj_score.year = res.fecha.getFullYear();
/* alert('Agregar al listado......'+JSON.stringify(eval(obj_score)));	 */
					    $scope.lista_indicadores_porcentaje.push(obj_score);
						if (total_record_count > 0)
							json_score.scores.push(obj_score);

					} // fin de for principal
					$scope.porciento_total = suma_porciento/indicadores_validos;
						json_score.timestamp = res.fecha;
						json_score.titulo_localidad = $rootScope.localidad;
				  } // fin de funcion proncipal RES
   );
}; // fin de la funcion mes_ano()


 var mes_ano = mes_ano();

 $scope.pasar = function () {
		var r = confirm("Are you sure you're ready to submit this SCORE ? if you select OK there is no way to undo this action.");
		if (r == true) {
			for(i = 0;i<$rootScope.envia_indicadores.length;i++)
				for (j = 0;j<$localStorage.disco_records.length;j++)
					if ($rootScope.envia_indicadores[i].id == $localStorage.disco_records[j].indicator_id && ($rootScope.fecha_trans.fecha.getMonth()+1 == $localStorage.disco_records[j].month) && !($localStorage.disco_records[j].scored) )
						$localStorage.disco_records[j].scored = true;

			$localStorage.disco_scores.push(json_score);

			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('menu.allLocationOutBox');
		} else {
			$scope.txt = "CANCEL....";
		}
	};


})

.controller('surveyCtrl', function ($scope, $rootScope, $state, $localStorage, $q, $http) {
	/* var meses = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; */

	var survey = $rootScope.survey;
	var localidad = $rootScope.localidad_id;
	var preguntas_ordenadas = [];
	/* por si es necesario ordenar las respuestas por su orden en la forma */
	$scope.valor = [];
	$scope.n_preguntas = [];


	/* $scope.currentDate = new Date();
	$scope.minDate = new Date(2000, 1, 1);
	$scope.maxDate = new Date(2040, 1, 31);

	$scope.datePickerCallback = function (val) {
			if (!val) {
				alert('Date not selected');
			} else {
				alert('Selected date is : ', val);
			}
	}; */

	$scope.fecha = new Date();

	var radios_validos = 0;
	var radios_positivos = 0;
	var json_score = {
						'title' : 'SCORE',
						'titulo_localidad' : '',
						'titulo_indicador' : '',
						'scores' : []
					};

	var obj_score = {
					'percentage' : 0,
					'location_id' : '',
					'indicator_id' : '',
					'total_record_count' : 0,
					'passing_record_count' : 0,
					'passing' : true,
					'month' : 0,
					'year' : 0
				};

	var json_record = {
						'title' : '(RECORD)',
						'titulo_localidad' : '',
						'titulo_indicador' : '',
						'location_id' : '',
						'indicator_id' : '',
						'day' : 0,
						'month' : 0,
						'year' : 0,
						'timestamp' : 0,
						'score' : 0.0,
						'scored' : false,
						'values' : []
					};

	var obj_record = {
						'field_id' : 0,
						'value' : true
						};




	/* alert(JSON.stringify(json_score)); */

	obj_score.indicator_id = survey.id;
	obj_score.location_id = localidad;
	json_score.titulo_indicador = survey.title;
	json_score.titulo_localidad = $rootScope.localidad;

	json_record.indicator_id = survey.id;
	json_record.location_id = localidad;
	json_record.titulo_indicador = survey.title;
	json_record.titulo_localidad = $rootScope.localidad;

	revisar_completitud = function () {
		var numero_items = $scope.valor.length;
		var faltan = [];
		for (i = 0; i < numero_items; i++)
				if ($scope.valor[i] == "-2")
					faltan.push(i + 1);
		return faltan;
	};

	calcular_promedio = function () {
		var numero_items_no_aplica = 0;
		var conteo_positivo_negativo = 0;
		var calculo_promedio = 0;
		var numero_items = $scope.valor.length;
		var numero_items_reales = 0;

		for (i = 0; i < numero_items; i++) {
			var obj_record = {
						'field_id' : 0,
						'value' : true
						};
			obj_record.field_id = $scope.n_preguntas[i];
			obj_record.value = $scope.valor[i];
			if ($scope.valor[i] == '1' || $scope.valor[i] == '0') {
				if($scope.valor[i] == '1') obj_record.value = true;
				if($scope.valor[i] == '0') obj_record.value = false;
				numero_items_reales++;
				conteo_positivo_negativo += parseInt($scope.valor[i], 10);
			}
			if ($scope.valor[i] == "-1") {numero_items_no_aplica++; obj_record.value = ''; numero_items_reales++;}

			json_record.values.push(obj_record);

		}
		obj_score.total_record_count = numero_items_reales - numero_items_no_aplica;
		obj_score.passing_record_count = conteo_positivo_negativo;
		calculo_promedio = (conteo_positivo_negativo / (numero_items_reales - numero_items_no_aplica)) * 100;
		calculo_promedio = parseFloat(calculo_promedio.toFixed(2));
		return calculo_promedio;
	};

	$scope.procesos = function () {
		var respuestas_no_validas = revisar_completitud();
		var porciento = 0;
		if (respuestas_no_validas.length == 0) {
			porciento = calcular_promedio();
			obj_score.passing = survey.passing_percentage <= porciento;
			obj_score.percentage = porciento;
			obj_score.month = $scope.fecha.getMonth() + 1;
			obj_score.year = $scope.fecha.getFullYear();
			json_score.scores.push(obj_score);

			json_record.day = $scope.fecha.getDate();
			json_record.month = $scope.fecha.getMonth() + 1;
			json_record.year = $scope.fecha.getFullYear();
			json_record.score = porciento;

			$rootScope.porcentaje = porciento.toFixed(2);
			
			json_record.timestamp = $scope.fecha;
			$rootScope.record = json_record;
			/* $rootScope.score = obj_score;
 */
		
		$state.go('finalScoreSurvey');
		} else
			alert("There are unanswered questions, answer please.." + respuestas_no_validas);
	};

})

.controller('finalScoreSurveyCtrl', function ($scope, $state, $rootScope, $localStorage) {
	
	var survey = $rootScope.survey;
	/* $localStorage.disco_scores = []; */
	/* $localStorage.disco_records = [];  */
	/* $localStorage.disco_scores.push($rootScope.score); */
	$localStorage.disco_records.push($rootScope.record);

	$scope.click_boton_derecho = function () {$localStorage.disco_records.pop(); /* $localStorage.disco_scores.pop(); */ $state.go('survey');};
	$scope.click_boton_izquierdo = function () {$state.go('menu.selectedIndicador');};

})

.controller('logoutCtrl', function ($scope, $http, $state, $localStorage, $rootScope,$ionicHistory,$ionicPopup ) {

	if(window.Connection) {
          if(navigator.connection.type == Connection.NONE) {
               $ionicPopup.confirm({
                   title: "Internet Disconnected",
                   content: "The internet is disconnected on your device."
                   }).then(function(result) {
                            if(!result) {
                                ionic.Platform.exitApp();
                            }
					  });
		}
	}


	$scope.dato = {};
	$scope.info = {};
	$rootScope.token = '';
	$scope.dato.email = '';
	$scope.dato.password = '';
	$rootScope.url_orchid = $localStorage.hostname;
	

	delete $localStorage.discolocations;
	delete $localStorage.discoindicators;
	delete $localStorage.discovisualizes;


		$http({
			method : 'GET',
			url : 'http://' + $localStorage.hostname + '/user/logout',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'X-Requested-With' : 'XMLHttpRequest'
			}
		}).then(function mySucces(response) {
			$ionicHistory.clearCache().then(function() {
							$ionicHistory.clearHistory();
							$ionicHistory.nextViewOptions({ disableBack: true, historyRoot: true }); 
							$state.go('login'); 
					});
		}, function myError(response) {
			alert("Ha fallado la petición. Estado HTTP: " + response.status);
		});
	
})

.controller('surveyEditCtrl', function ($scope, $rootScope, $state, $localStorage, $q, $http) {
	
	var json_record = {
						'title' : '(RECORD)',
						'titulo_localidad' : '',
						'titulo_indicador' : '',
						'location_id' : '',
						'indicator_id' : '',
						'day' : 0,
						'month' : 0,
						'year' : 0,
						'timestamp' : 0,
						'score' : 0.0,
						'scored' : false,
						'values' : []
					};

	var obj_record = {
						'field_id' : 0,
						'value' : true
						};
		
	$scope.valor = [];
	$scope.n_preguntas = [];
	$scope.survey = $rootScope.indicadoresedit;
	var surveyresp = $rootScope.surveyEditResp;
	$scope.titulo_pagina = surveyresp.title;
	$scope.fecha = new Date();
	json_record.titulo_localidad = surveyresp.titulo_localidad;
	json_record.titulo_indicador = surveyresp.titulo_indicador;
	json_record.location_id = surveyresp.location_id;
	json_record.indicator_id = surveyresp.indicator_id;
		

    for( i = 0 ; i < $scope.survey.length ; i++){
		if ( ($scope.survey[i].field_type == 'TEXT' || $scope.survey[i].field_type == 'TEXTAREA') && $scope.survey[i].visible == true){
			$scope.valor[i] = surveyresp.values[i].value;
		}	
 		else if ($scope.survey[i].field_type == 'CHECKBOX' && $scope.survey[i].visible == true){
			if(surveyresp.values[i].value === true) {$scope.valor[i] = "1";} 
				else
					if(surveyresp.values[i].value === false) {$scope.valor[i] = "0";} 
						else
							if(surveyresp.values[i].value === '') {$scope.valor[i] = "-1";}
		}
	}
	
	calcular_promedio = function () {
		var numero_items_no_aplica = 0;
		var conteo_positivo_negativo = 0;
		var calculo_promedio = 0;
		var numero_items = $scope.survey.length;
		var numero_items_reales = 0;

		for (i = 0; i < numero_items; i++) {
			var obj_record = {
						'field_id' : 0,
						'value' : true
						};
			obj_record.field_id = $scope.n_preguntas[i];
			obj_record.value = $scope.valor[i];
			if ($scope.valor[i] == '1' || $scope.valor[i] == '0') {
				if($scope.valor[i] == '1') obj_record.value = true;
				if($scope.valor[i] == '0') obj_record.value = false;
				numero_items_reales++;
				conteo_positivo_negativo += parseInt($scope.valor[i], 10);
			}
			if ($scope.valor[i] == "-1") {numero_items_no_aplica++; obj_record.value = ''; numero_items_reales++;}

			json_record.values.push(obj_record);

		}
		calculo_promedio = (conteo_positivo_negativo / (numero_items_reales - numero_items_no_aplica)) * 100;
		return calculo_promedio;
	};
	
	$scope.procesos = function () {
		
		
			var porciento = 0;
		
			porciento = calcular_promedio();
			
			json_record.day = $scope.fecha.getDate();
			json_record.month = $scope.fecha.getMonth() + 1;
			json_record.year = $scope.fecha.getFullYear();
			json_record.score = porciento;

			$rootScope.porcentaje = porciento.toFixed(2);
			
			json_record.timestamp = $scope.fecha;
			$rootScope.record = json_record;
		
		$state.go('finalScoreSurvey');
		
	};
	
})

.controller('photoCtrl', function ($scope, $ionicPlatform, $cordovaCamera, $localStorage) {
	
	$scope.photos = [];
	$scope.getPhoto = function(type){
		$ionicPlatform.ready(function(){
			$cordovaCamera.getPicture({
				destinationType: navigator.camera.DestinationType.FILE_URL,
				sourceType: navigator.camera.PictureSourceType[type.toUpperCase()]
			}).then(function(photo){
				/* $localStorage.disco_fotos.unshift(photo); */
				$scope.photos.unshift(photo);
			}, function(err){
				alert(err);
			});
		});
	};
	
})

.controller('menuCtrl', function ($scope, $localStorage) {})
