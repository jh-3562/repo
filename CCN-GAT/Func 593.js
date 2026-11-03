console.log("Function 593", context);


const UserRole = async (email, roles) => {
    const autoSaveInfo = {
        AutoSaveInfo: {
            dtoName: "AutoSaveInfo",
            id: email,
            autoSaveEdits: [
                {
                    dtoName: "AutoSaveEdit",
                    name: "Roles",
                    value: roles,
                },
            ],
        },
    };

    return api({ local: true }).put("authentication/AS", autoSaveInfo);
};



const addRoleToCurrentUser = async (roleToAdd) => {
    const email = context?.store?.moduleStore?.user?.username;

    if (!email) {
        throw new Error("Email utilisateur introuvable dans moduleStore");
    }

    const existingRoles =
        context?.store?.moduleStore?.user?.roles ?? [];

    const roles = existingRoles.includes(roleToAdd)
        ? existingRoles
        : [...existingRoles, roleToAdd];

    return await UserRole(email, roles);
};



(async () => {
    try {
        await addRoleToCurrentUser("Ergotherapeute");
        console.log("Rôle ajouté avec succès");
    } catch (err) {
        console.error("Erreur ajout rôle", err);
    }
})();
