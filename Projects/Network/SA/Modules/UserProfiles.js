exports.newNetworkModulesUserProfiles = function newNetworkModulesUserProfiles() {
    /*
    This module is usefull for all Apps that needs to operate with all User Profiles loaded in 
    memory maps. 
    
    User Profiles are plugins of the Governance System. Besides the info they carry, we also 
    need to read the blockchain for each one in order to calculate their ranking.
    */
    let thisObject = {
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {

        let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
            'Governance',
            'User-Profiles'
        )

        for (let i = 0; i < pluginFileNames.length; i++) {
            let pluginFileName = pluginFileNames[i]

            let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                'Governance',
                'User-Profiles',
                pluginFileName
            )

            let userProfilePlugin = JSON.parse(pluginFileContent)
            let config = JSON.parse(userProfilePlugin.config)
            let signatureObject = config.signature
            let web3 = new SA.nodeModules.web3()
            let blockchainAccount = web3.eth.accounts.recover(signatureObject)
            let ranking = 0 // TODO: read the blockchain balance and transactions from the Treasury Account to calculate the profile ranking.
            let userProfileId = userProfilePlugin.id
            let userHandle = config.signature.message

            let userProfile = SA.projects.socialTrading.modules.socialGraphUserProfile.newSocialTradingModulesSocialGraphUserProfile()
            userProfile.initialize(
                userProfileId,
                userHandle,
                blockchainAccount,
                ranking
            )

            SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfileId, userProfile)
            SA.projects.network.globals.memory.maps.USER_PROFILES_BY_HANDLE.set(userHandle, userProfile)
            SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOCHAIN_ACCOUNT.set(blockchainAccount, userProfile)
            /*
            Each User Profile might have Signing Accounts, meaning
            accounts that can be siging on behalf of the User Profile.
            */
            if (userProfilePlugin.signingAccounts !== undefined) {
                for (let j = 0; j < userProfilePlugin.signingAccounts.signingAccounts.length; j++) {
                    let signingAccount = userProfilePlugin.signingAccounts.signingAccounts[j]
                    let config = JSON.parse(signingAccount.config)
                    let signatureObject = config.signature
                    let web3 = new SA.nodeModules.web3()
                    let blockchainAccount = web3.eth.accounts.recover(signatureObject)
                    SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOCHAIN_ACCOUNT.set(blockchainAccount, userProfile)
                }
            }
        }
    }
}