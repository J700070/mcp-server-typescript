export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
}
