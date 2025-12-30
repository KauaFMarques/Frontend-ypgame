export async function load() {
    const response = await fetch("https://yp-ghwh.onrender.com/questions")
    if (response.ok) {
        return {
            questions: await response.json(),
        }
    }
}
/*C:\Users\ferre\Projects\ProjectFront\tccProject\Frontend\yp-svlt\src\routes\+layout.server.js*/
