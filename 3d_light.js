var canvas = document.getElementById('3d_light');
var context = canvas.getContext('2d');

var lines = [];
var points = [];

var clk = 0;

var alpha_y = 45*Math.PI/180;
var alpha_x = -55*Math.PI/180;

var M_y = [ Math.cos(alpha_y), 0, Math.sin(alpha_y), 0,
              0,  1, 0,  0,
             -1*Math.sin(alpha_y), 0, Math.cos(alpha_y), 0,
             0,   0, 0,  1];

var M_x = [ Math.cos(alpha_x), -1*Math.sin(alpha_x), 0, 0,
            Math.sin(alpha_x), Math.cos(alpha_x), 0, 0,
              0, 0, 1, 0,
              0, 0, 0, 1];

var vertexes = [[0,0,0],
				[1,0,0],
				[1,1,0],
				[0,1,0],
				[0.5,0.5,1.6]];
				
var indexes = [[5,2,3],
				[4,5,3],
				[6,3,2],
				[5,6,2],
				[4,6,5],
				[6,4,3]];
				
function Mult_mv(M, v, dim){
            var res = [];
            for (var i=0; i<dim;i++) {
                res.push(0);
                for (var j=0; j<dim; j++) {
                    res[i] = res[i] + M[i*dim+j]*v[j];
                    
                }
            }
            return res;
}

canvas.addEventListener("click", function(event){
		if(clk == 0){
			for(var i = 0; i < vertexes.length; i++){
				var rotate = Mult_mv(M_x, [vertexes[i][0], vertexes[i][1], vertexes[i][2], 1], 4);
				rotate = Mult_mv(M_y, rotate, 4);
				vertexes[i][0] = rotate[0];
				vertexes[i][1] = rotate[1];
				vertexes[i][2] = rotate[2];
				
			}
			clk = 1;
		}
		else{
			x0 = event.offsetX;
			y0 = event.offsetY;
			z0 = Number(prompt('z coordinate =  ', "500"));
			context.fillRect(x0,y0,2,2);
			var light = {x:x0, y:y0, z:z0};
			for (let el of indexes){
					points = [];
					lines = [];
					
					points.push({x: vertexes[el[0] - 2][0]* 100+ 200, y: vertexes[el[0] - 2][1] * 100+ 200});
					points.push({x: vertexes[el[1] - 2][0] * 100+ 200, y: vertexes[el[1] - 2][1] * 100+ 200});
					points.push({x: vertexes[el[2] - 2][0] * 100+ 200, y: vertexes[el[2] - 2][1] * 100+ 200});
					points.push({x: vertexes[el[0] - 2][0]* 100+ 200, y: vertexes[el[0] - 2][1] * 100+ 200});
					
					var A = {x:vertexes[el[0] - 2][0]* 100+ 200,
					y:vertexes[el[0] - 2][1] * 100+ 200,
					z:vertexes[el[0] - 2][2]* 100+ 200};
					
					var B = {x:vertexes[el[1] - 2][0] * 100+ 200,
					y:vertexes[el[1] - 2][1] * 100+ 200,
					z:vertexes[el[1] - 2][2] * 100+ 200};
					
					var C = {x:vertexes[el[2] - 2][0] * 100+ 200,
					y:vertexes[el[2] - 2][1] * 100+ 200,
					z:vertexes[el[2] - 2][2] * 100+ 200};
					
					color3dPlane(light, A, B, C, points);
			}
		} 
});
				
function color3dPlane(light, A, B, C, points){
	var I_ph = 20;
	var I_p = 200;
	var K_p = 0.5;
	
	var center = {x:(((C.x + B.x)/2)+A.x)/2,
					y:(((C.y + B.y)/2)+A.y)/2,
					z:(((C.z + B.z)/2)+ A.z)/2};
	
	var light_vector = {x:light.x - center.x,
						y:light.y - center.y,
						z:light.z - center.z};

	var N = {x:(B.y - A.y) * (C.z - A.z) - (C.y - A.y) * (B.z - A.z),
			y:(C.x - A.x) * (B.z - A.z) - (B.x - A.x) * (C.z - A.z),
			z:(B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)};
	
	var observer = {x:0,
					y:0,
					z:1000};
					
	if(cos(observer, N) >= 0){
		var cos_phi = cos(light_vector, N);
		var I = I_ph + K_p*I_p*cos_phi;
		context.strokeStyle = `rgb(${255-I},0,0)`;
		
		drawLine(A.x , A.y, B.x , B.y);
		drawLine(A.x, A.y, C.x , C.y);
		drawLine(C.x , C.y, B.x, B.y);
		
		var minY = points[0].y;
		var maxY = points[0].y;
		for (var i = 0; i < points.length; i++) {
			var temp = points[i].y;
			if (temp < minY)
					minY = temp;
				else if (temp > maxY)
					maxY = temp;
			}
			for (var i = 1; i < points.length; i++) {
				lines.push(new Line(points[i - 1], points[i]));
			}
		context.beginPath();
			for (var y = minY; y < maxY; y++) {
				var meetPoint = getMeetPoint(y);
				for (var i = 1; i < meetPoint.length; i += 2) {
					context.moveTo(meetPoint[i - 1], y);
					context.lineTo(meetPoint[i], y);
				}
			}
		context.closePath();
		context.stroke();
	}
}

function cos(vec1, vec2){
	return (vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z)
          / (Math.sqrt(Math.pow(vec1.x, 2) + Math.pow(vec1.y, 2) + Math.pow(vec1.z, 2))
              * Math.sqrt(Math.pow(vec2.x, 2) + Math.pow(vec2.y, 2) + Math.pow(vec2.z, 2)));
}

function drawLine(Xd, Yd, Xf, Yf){
			var Dx,Dy,Dx2,Dy2,Dxy,S;
			var Xinc,Yinc,X,Y;
			var col, i;
			col = 5;
			if (Xd < Xf) Xinc = 1; else Xinc = -1;
			if (Yd < Yf) Yinc = 1; else Yinc = -1;
			Dx = Math.abs(Xd - Xf);
			Dy = Math.abs(Yd - Yf);
			Dx2 = Dx + Dx; Dy2 = Dy + Dy;
			X = Xd; Y = Yd;
				if (Dx > Dy){
				S = Dy2 - Dx;
				Dxy = Dy2 - Dx2;
				for (i=0; i < Dx; i++){
					if (S >= 0){
						Y = Y + Yinc;
						S = S + Dxy;
 					} else S = S + Dy2;
					X = X + Xinc;
					context.fillRect(X,Y,1,1);
				}
			}
            else{
                S = Dx2 - Dy;
                Dxy = Dx2 - Dy2;
                for (i=0; i < Dy; i++){
                    if ( S >= 0){
                        X = X + Xinc;
                        S = S + Dxy;
                    } else S = S + Dx2;
                    Y = Y + Yinc;
                    context.fillRect(X,Y,1,1);
                }
            }
}

function getMeetPoint(y) {
    var meet = [];
    for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (l.isValidY(y)) {
            meet.push(l.getX(y));
        }
    }

    for (var i = 0; i < meet.length; i++)
        for (var j = i; j < meet.length; j++) {
            if (meet[i]>meet[j]) {
                var temp =meet[i];
                meet[i]=meet[j];
                meet[j]=temp;
            }
        }
    return  meet;
}
				
function Line(start, end) {
    this.x0 = start.x;
    this.x1 = end.x;
    this.y0 = start.y;
    this.y1 = end.y;
    this.m = (this.y1 - this.y0) / (this.x1 - this.x0);
    this.getX = function (y) {
        return 1 / this.m * (y - this.y0) + this.x0;
    }

    this.isValidY = function (y) {
        if (y >= this.y0 && y < this.y1) {
            return true;
        }
        if (y >= this.y1 && y < this.y0) {
            return true;
        }
	}
}