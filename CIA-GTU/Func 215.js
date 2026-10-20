console.log("Function 215", context);

const roleUser = store.moduleStore.user.roles[0];
const rolesAutorises = ["Répartiteur", "Admin"];


async function main() {
if (!rolesAutorises.includes(roleUser)) {
  return {
    Demande_TransportTransportSimpleDateTransportDepart: { min: new Date().toISOString().split("T")[0] },
    Demande_TransportTransportSimpleDateTransportArrivee: { min: new Date().toISOString().split("T")[0] },
    Demande_TransportTransportRetourDateTransportDepart: { min: new Date().toISOString().split("T")[0] },
    Demande_TransportTransportRetourDateTransportArrivee: { min: new Date().toISOString().split("T")[0] },
    
  };
}
}

main();
