import crypto from "crypto"

export default function genUniqueId() {
	return crypto.randomBytes(32).toString("base64url")
}