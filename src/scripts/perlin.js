let perlin = {
    rand_vect: function () {
        let theta = Math.random() * 2 * Math.PI;
        return { x: Math.cos(theta), y: Math.sin(theta) };
    },
    dot_prod_grid: function (x, y, vx, vy) {
        const key = `${vx},${vy}`;
        let g_vect = this.gradients[key] || (this.gradients[key] = this.rand_vect());
        return (x - vx) * g_vect.x + (y - vy) * g_vect.y;
    },
    smootherstep: function (x) {
        return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    },
    interp: function (x, a, b) {
        return a + this.smootherstep(x) * (b - a);
    },
    seed: function () {
        this.gradients = {};
        this.memory = {};
    },
    get: function (x, y) {
        const key = `${x},${y}`;
        if (this.memory[key]) return this.memory[key];

        const xf = Math.floor(x);
        const yf = Math.floor(y);
        
        const x_diff = x - xf;
        const y_diff = y - yf;

        //interpolate
        const tl = this.dot_prod_grid(x, y, xf, yf);
        const tr = this.dot_prod_grid(x, y, xf + 1, yf);
        const bl = this.dot_prod_grid(x, y, xf, yf + 1);
        const br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
        const xt = this.interp(x_diff, tl, tr);
        const xb = this.interp(x_diff, bl, br);
        const v = this.interp(y_diff, xt, xb);
        
        this.memory[key] = v;
        return v;
    }
}
perlin.seed();
export default perlin;