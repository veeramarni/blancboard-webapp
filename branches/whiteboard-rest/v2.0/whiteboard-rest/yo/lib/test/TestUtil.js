= {
	makeName: function(t, e, i, n) {
		function o(t, e) {
			return t > e ? 0 : Math.floor(Math.random() * (e - t + 1)) + t
		}
		i = i || "",
			n = n || "";
		var s = "aeiouyhaeiouaeiou",
			a = "bcdfghjklmnpqrstvwxzbcdfgjklmnprstvwbcdfgjklmnprst",
			r = s + a,
			l = o(t, e) - i.length - n.length;
		1 > l && (l = 1);
		var h, c = 0;
		if (i.length > 0)
			for (h = 0; i.length > h; h++)
				2 == c && (c = 0), -1 != a.indexOf(i[h]) && c++;
		else
			c = 1;
		var d = i;
		for (h = 0; l > h; h++) {
			var u;
			2 == c ? (u = s,
				c = 0) : u = r;
			var g = u.charAt(o(0, u.length - 1));
			d += g, -1 != a.indexOf(g) && c++
		}
		return d = d.charAt(0).toUpperCase() + d.substring(1, d.length) + n
	}
}