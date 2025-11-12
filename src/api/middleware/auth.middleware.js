const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../../models/user/user.model');

module.exports = async function (req, res, next) {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó un token válido en el encabezado Authorization.' 
        });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ 
                error: 'Token inválido. Usuario no encontrado.' 
            });
        }

        if (user.estado_cuenta !== 'activo') {
            return res.status(401).json({ 
                error: 'Cuenta inactiva.' 
            });
        }

        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ 
            error: 'Token inválido.' 
        });
    }
};
