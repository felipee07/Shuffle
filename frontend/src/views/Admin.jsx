import React, { useEffect} from 'react';

import { makeStyles } from '@material-ui/styles';
import {Link} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Zoom from '@material-ui/core/Zoom';
import { useAlert } from "react-alert";

import { Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import HandlePayment from './HandlePayment'
import OrgHeader from '../components/OrgHeader'

import PolymerIcon from '@material-ui/icons/Polymer';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';
import AppsIcon from '@material-ui/icons/Apps';
import ImageIcon from '@material-ui/icons/Image';
import DeleteIcon from '@material-ui/icons/Delete';
import CachedIcon from '@material-ui/icons/Cached';
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew';
import LockIcon from '@material-ui/icons/Lock';
import EcoIcon from '@material-ui/icons/Eco';
import ScheduleIcon from '@material-ui/icons/Schedule';
import CloudIcon from '@material-ui/icons/Cloud';
import BusinessIcon from '@material-ui/icons/Business';


const useStyles = makeStyles({
	notchedOutline: {
		borderColor: "#f85a3e !important"
	},
})

const Admin = (props) => {
	const { globalUrl, userdata } = props;

	var upload = ""
	const theme = useTheme();
	const classes = useStyles();
	const [firstRequest, setFirstRequest] = React.useState(true);
	const [modalUser, setModalUser] = React.useState({});
	const [modalOpen, setModalOpen] = React.useState(false);

	const [cloudSyncModalOpen, setCloudSyncModalOpen] = React.useState(false);
	const [cloudSyncApikey, setCloudSyncApikey] = React.useState("");
	const [loading, setLoading] = React.useState(false);

	const [selectedOrganization, setSelectedOrganization] = React.useState({});
	const [organizationFeatures, setOrganizationFeatures] = React.useState({});
	const [loginInfo, setLoginInfo] = React.useState("");
	const [curTab, setCurTab] = React.useState(0);
	const [users, setUsers] = React.useState([]);
	const [organizations, setOrganizations] = React.useState([]);
	const [orgSyncResponse, setOrgSyncResponse] = React.useState("");
	const [userSettings, setUserSettings] = React.useState({});

	const [environments, setEnvironments] = React.useState([]);
	const [authentication, setAuthentication] = React.useState([]);
	const [schedules, setSchedules] = React.useState([])
	const [selectedUser, setSelectedUser] = React.useState({})
	const [newPassword, setNewPassword] = React.useState("");
	const [selectedUserModalOpen, setSelectedUserModalOpen] = React.useState(false)
	const [selectedAuthentication, setSelectedAuthentication] = React.useState({})
	const [selectedAuthenticationModalOpen, setSelectedAuthenticationModalOpen] = React.useState(false)
	const [showArchived, setShowArchived] = React.useState(false)

	const isCloud = window.location.host === "localhost:3002" || window.location.host === "shuffler.io" 
	const getApps = () => {
		fetch(globalUrl+"/api/v1/workflows/apps", {
    	  method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
	  			credentials: "include",
    		})
		.then((response) => {
			if (response.status !== 200) {
				console.log("Status not 200 for apps :O!")
			}

			return response.json()
		})
    .then((responseJson) => {
			console.log("apps: ", responseJson)
			//setApps(responseJson)
			//setFilteredApps(responseJson)
			//if (responseJson.length > 0) {
			//	setSelectedApp(responseJson[0])
			//	if (responseJson[0].actions !== null && responseJson[0].actions.length > 0) {
			//		setSelectedAction(responseJson[0].actions[0])
			//	} else {
			//		setSelectedAction({})
			//	}
			//} 
    })
		.catch(error => {
			alert.error(error.toString())
		});
	}

	const categories = [
		{
			"name": "Ticketing", 
			"apps": [
				"TheHive",
				"Service-Now",
				"SecureWorks",
			],
			"categories": ["tickets", "ticket", "ticketing"]
		},
	]
	/*
		"SIEM",
		"Active Directory",
		"Firewalls", 
		"Proxies web",
		"SIEM", 
		"SOAR",
		"Mail",
		"EDR",
		"AV", 
		"MDM/MAM",
		"DNS",
		"Ticketing platform",
		"TIP",
		"Communication", 
		"DDOS protection",
		"VMS",
	]
	*/

	const alert = useAlert()

	const deleteAuthentication = (data) => {
		alert.info("Deleting auth " + data.label)

		// Just use this one?
		const url = globalUrl + '/api/v1/apps/authentication/' + data.id
		console.log("URL: ", url)
		fetch(url, {
			method: 'DELETE',
			credentials: "include",
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then(response =>
			response.json().then(responseJson => {
				console.log("RESP: ", responseJson)
				if (responseJson["success"] === false) {
					alert.error("Failed stopping schedule")
				} else {
					getAppAuthentication() 
					alert.success("Successfully deleted authentication!")
				}
			}),
		)
		.catch(error => {
			console.log("Error in userdata: ", error)
		});
	}

	const deleteSchedule = (data) => {
		// FIXME - add some check here ROFL
		console.log("INPUT: ", data)

		// Just use this one?
		const url = globalUrl + '/api/v1/workflows/' + data["workflow_id"] + "/schedule/" + data.id
		console.log("URL: ", url)
		fetch(url, {
			method: 'DELETE',
			credentials: "include",
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response =>
				response.json().then(responseJson => {
					console.log("RESP: ", responseJson)
					if (responseJson["success"] === false) {
						alert.error("Failed stopping schedule")
					} else {
						getSchedules()
						alert.success("Successfully stopped schedule!")
					}
				}),
			)
			.catch(error => {
				console.log("Error in userdata: ", error)
			});
	}

	const enableCloudSync = (apikey, organization, disableSync) => {
		setOrgSyncResponse("")

		const data = { 
			apikey: apikey,
			organization: organization,
			disable: disableSync,
		}

		const url = globalUrl + '/api/v1/cloud/setup';
		fetch(url, {
			mode: 'cors',
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'include',
			crossDomain: true,
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		})
		.then(response => {
			setLoading(false)
			if (response.status === 200) {
				console.log("Cloud sync success?")
			} else {
				console.log("Cloud sync fail?")
			}

			return response.json()
		})
    .then((responseJson) => {
			if (!responseJson.success && responseJson.reason !== undefined) {
				setOrgSyncResponse(responseJson.reason)
				alert.error("Failed to handle sync: "+responseJson.reason)
			} else if (!responseJson.success) {
				alert.error("Failed to handle sync.")
			} else {
				getOrgs() 
				if (disableSync) {
					alert.success("Successfully disabled sync!")
					setOrgSyncResponse("Successfully disabled syncronization")
				} else {
					alert.success("Cloud Syncronization successfully set up!")
					setOrgSyncResponse("Successfully started syncronization. Cloud features you now have access to can be seen below.")
				}

				selectedOrganization.cloud_sync = !selectedOrganization.cloud_sync
				setSelectedOrganization(selectedOrganization)
				setCloudSyncApikey("")

				handleGetOrg(userdata.active_org.id) 
			}
		})
		.catch(error => {
			setLoading(false)
			alert.error("Err: " + error.toString())
		})
	}

	
	
	

	const onPasswordChange = () => {
		const data = { "username": selectedUser.username, "newpassword": newPassword }
		const url = globalUrl + '/api/v1/users/passwordchange';

		fetch(url, {
			mode: 'cors',
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'include',
			crossDomain: true,
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		})
			.then(response =>
				response.json().then(responseJson => {
					if (responseJson["success"] === false) {
						alert.error("Failed setting new password")
					} else {
						alert.success("Successfully password!")
						setSelectedUserModalOpen(false)
					}
				}),
			)
			.catch(error => {
				alert.error("Err: " + error.toString())
			});
	}

	const deleteUser = (data) => {
		// Just use this one?
		const url = globalUrl + '/api/v1/users/' + data.id
		fetch(url, {
			method: 'DELETE',
			credentials: "include",
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then(response => {
			if (response.status === 200) {
				getUsers()
			}

			return response.json()
		})
    .then((responseJson) => {
			if (!responseJson.success && responseJson.reason !== undefined) {
				alert.error("Failed to deactivate user: "+responseJson.reason)
			} else {
				alert.success("Deactivated user "+data.id)
			}
		})

		.catch(error => {
			console.log("Error in userdata: ", error)
		});
	}

	const handleGetOrg = (orgId) => {
		// Just use this one?
		var baseurl = globalUrl
		const url = baseurl + '/api/v1/orgs/'+orgId
		fetch(url, {
			method: 'GET',
			credentials: "include",
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then(response => {
			if (response.status === 401) {
			}

			return response.json()
		})
		.then(responseJson => {
			if (responseJson["success"] === false) {
				alert.error("Failed getting org: ", responseJson.readon)
			} else {
				setSelectedOrganization(responseJson)
				var lists = {
					"active": {
						"triggers": [],
						"features": [],
						"sync": [],
					},
					"inactive": {
						"triggers": [],
						"features": [],
						"sync": [],
					},
				}


				// FIXME: Set up features
				Object.keys(responseJson.sync_features).map(function(key, index) {
					//console.log(responseJson.sync_features[key])
				})

				//setOrgName(responseJson.name)
				//setOrgDescription(responseJson.description)
				setOrganizationFeatures(lists)
			}
		})
		.catch(error => {
			console.log("Error getting org: ", error)
			alert.error("Error getting current organization")
		});
	}

	const submitUser = (data) => {
		console.log("INPUT: ", data)

		// Just use this one?
		var data = { "username": data.Username, "password": data.Password }
		var baseurl = globalUrl
		const url = baseurl + '/api/v1/users/register';
		fetch(url, {
			method: 'POST',
			credentials: "include",
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response =>
				response.json().then(responseJson => {
					if (responseJson["success"] === false) {
						setLoginInfo("Error in input: " + responseJson.reason)
					} else {
						setLoginInfo("")
						setModalOpen(false)
						getUsers()
					}
				}),
			)
			.catch(error => {
				console.log("Error in userdata: ", error)
			});
	}

	// Horrible frontend fix for environments
	const setDefaultEnvironment = (name) => {
		// FIXME - add some check here ROFL
		alert.info("Setting default env to " + name)
		var newEnv = []
		for (var key in environments) {
			if (environments[key].Name == name) {
				if (environments[key].archived) {
					alert.error("Can't set archived to default")
					return
				}

				environments[key].default = true
			} else if (environments[key].default == true && environments[key].name !== name) {
				environments[key].default = false 
			}

			newEnv.push(environments[key])
		}

		// Just use this one?
		const url = globalUrl + '/api/v1/setenvironments';
		fetch(url, {
			method: 'PUT',
			credentials: "include",
			body: JSON.stringify(newEnv),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response =>
				response.json().then(responseJson => {
					if (responseJson["success"] === false) {
						alert.error(responseJson.reason)
						getEnvironments()
					} else {
						setLoginInfo("")
						setModalOpen(false)
						getEnvironments()
					}
				}),
			)
		.catch(error => {
			console.log("Error in backend data: ", error)
		})
	}

	const deleteEnvironment = (name) => {
		// FIXME - add some check here ROFL
		alert.info("Deleting environment " + name)
		var newEnv = []
		for (var key in environments) {
			if (environments[key].Name == name) {
				if (environments[key].default) {
					alert.error("Can't delete the default environment")
					return
				}

				if (environments[key].type === "cloud") {
					alert.error("Can't delete the cloud environments")
					return
				}

				environments[key].archived = true
			}

			newEnv.push(environments[key])
		}

		// Just use this one?
		const url = globalUrl + '/api/v1/setenvironments';
		fetch(url, {
			method: 'PUT',
			credentials: "include",
			body: JSON.stringify(newEnv),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response =>
				response.json().then(responseJson => {
					if (responseJson["success"] === false) {
						alert.error(responseJson.reason)
						getEnvironments()
					} else {
						setLoginInfo("")
						setModalOpen(false)
						getEnvironments()
					}
				}),
			)
		.catch(error => {
			console.log("Error when deleting: ", error)
		})
	}

	const submitEnvironment = (data) => {
		// FIXME - add some check here ROFL
		environments.push({
			"name": data.environment, 
			"type": "onprem",
		})

		// Just use this one?
		var baseurl = globalUrl
		const url = baseurl + '/api/v1/setenvironments';
		fetch(url, {
			method: 'PUT',
			credentials: "include",
			body: JSON.stringify(environments),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response =>
				response.json().then(responseJson => {
					if (responseJson["success"] === false) {
						setLoginInfo("Error in input: " + responseJson.reason)
						getEnvironments()
					} else {
						setLoginInfo("")
						setModalOpen(false)
						getEnvironments()
					}
				}),
			)
			.catch(error => {
				console.log("Error in userdata: ", error)
			});
	}

	const getSchedules = () => {
		fetch(globalUrl + "/api/v1/workflows/schedules", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log("Status not 200 for apps :O!")
					return
				}

				return response.json()
			})
			.then((responseJson) => {
				console.log(responseJson)
				setSchedules(responseJson)
			})
			.catch(error => {
				alert.error(error.toString())
			});
	}

	const getAppAuthentication = () => {
		fetch(globalUrl + "/api/v1/apps/authentication", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log("Status not 200 for apps :O!")
					return
				}

				return response.json()
			})
			.then((responseJson) => {
				if (responseJson.success) {
					//console.log(responseJson.data)
					setAuthentication(responseJson.data)
				} else {
					alert.error("Failed getting authentications")
				}
			})
			.catch(error => {
				alert.error(error.toString())
			});
	}

	const getEnvironments = () => {
		fetch(globalUrl + "/api/v1/getenvironments", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log("Status not 200 for apps :O!")
					return
				}

				return response.json()
			})
			.then((responseJson) => {
				setEnvironments(responseJson)
			})
			.catch(error => {
				alert.error(error.toString())
			});
	}

	const getOrgs = () => {
		fetch(globalUrl + "/api/v1/orgs", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log("Status not 200 for apps :O!")
					return
				}

				return response.json()
			})
			.then((responseJson) => {
				setOrganizations(responseJson)
			})
			.catch(error => {
				alert.error(error.toString())
			});
	}

	const getUsers = () => {
		fetch(globalUrl + "/api/v1/getusers", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					window.location.pathname = "/workflows"
					return
				}

				return response.json()
			})
			.then((responseJson) => {
				setUsers(responseJson)
			})
			.catch(error => {
				alert.error(error.toString())
			});
	}

	const getSettings = () => {
		fetch(globalUrl+"/api/v1/getsettings", {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
				credentials: "include",
			})
		.then((response) => {
			if (response.status !== 200) {
				console.log("Status not 200 when getting settings :O!")
			}

			return response.json()
		})
    .then((responseJson) => {
			setUserSettings(responseJson)
    })
		.catch(error => {
    		console.log(error)
		});
	}


	if (firstRequest) {
		setFirstRequest(false)
		if (!isCloud) {
			getUsers()
		} else {
			getSettings()
		}

		const views = {
			"organization": 0,
			"users": 1,
			"app_auth": 2,
			"environments": 3,
			"schedules": 4,
			"categories": 5,
		}

		if (props.match.params.key !== undefined) {
			const tmpitem = views[props.match.params.key]
			if (tmpitem !== undefined) {
				setCurTab(tmpitem)
			}
		}
	}

	if (selectedOrganization.id === undefined && userdata !== undefined && userdata.active_org !== undefined) {
		//setSelectedOrganization(userdata.active_org)
		handleGetOrg(userdata.active_org.id)
	}

	const paperStyle = {
		maxWidth: 1250,
		margin: "auto",
		color: "white",
		backgroundColor: theme.palette.surfaceColor,
		marginBottom: 10,
		padding: 20,
	}

	const changeModalData = (field, value) => {
		modalUser[field] = value
	}

	const setUser = (userId, field, value) => {
		const data = { "user_id": userId }
		data[field] = value
		console.log("DATA: ", data)

		fetch(globalUrl + "/api/v1/users/updateuser", {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log("Status not 200 for WORKFLOW EXECUTION :O!")
				} else {
					getUsers()
				}

				return response.json()
			})
			.then((responseJson) => {
				if (!responseJson.success && responseJson.reason !== undefined) {
					alert.error("Failed setting user: " + responseJson.reason)
				} else {
					alert.success("Set the user field " + field + " to " + value)
				}
			})
			.catch(error => {
				console.log(error)
			});
	}



	const generateApikey = (userId) => {
		const data = { "user_id": userId }

		fetch(globalUrl + "/api/v1/generateapikey", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: "include",
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log("Status not 200 for WORKFLOW EXECUTION :O!")
				} else {
					getUsers()
				}

				return response.json()
			})
			.then((responseJson) => {
				console.log("RESP: ", responseJson)
				if (!responseJson.success && responseJson.reason !== undefined) {
					alert.error("Failed getting new: " + responseJson.reason)
				} else {
					alert.success("Got new API key")
				}
			})
			.catch(error => {
				console.log(error)
			});
	}

	const editAuthenticationModal =
		<Dialog modal
			open={selectedAuthenticationModalOpen}
			onClose={() => { setSelectedAuthenticationModalOpen(false) }}
			PaperProps={{
				style: {
					backgroundColor: theme.palette.surfaceColor,
					color: "white",
					minWidth: "800px",
					minHeight: "320px",
				},
			}}
		>
			<DialogTitle><span style={{ color: "white" }}>Edit authentication</span></DialogTitle>
			<DialogContent>
				<div style={{ display: "flex" }}>
					<TextField
						style={{ backgroundColor: theme.palette.inputColor, flex: 3 }}
						InputProps={{
							style: {
								height: 50,
								color: "white",
							},
						}}
						color="primary"
						required
						fullWidth={true}
						placeholder="New password"
						type="password"
						id="standard-required"
						autoComplete="password"
						margin="normal"
						variant="outlined"
						onChange={e => setNewPassword(e.target.value)}
					/>
					<Button
						style={{ maxHeight: 50, flex: 1 }}
						variant="outlined"
						color="primary"
						onClick={() => onPasswordChange()}
					>
						Submit
					</Button>
				</div>
				<Divider style={{ marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor }} />
				<Button
					style={{}}
					variant="outlined"
					color="primary"
					onClick={() => deleteUser(selectedUser)}
				>
					{selectedUser.active ? "Deactivate" : "Activate"}
				</Button>
				<Button
					style={{}}
					variant="outlined"
					color="primary"
					onClick={() => generateApikey(selectedUser.id)}
				>
					Get new API key
				</Button>
			</DialogContent>
		</Dialog>

	const editUserModal =
		<Dialog modal
			open={selectedUserModalOpen}
			onClose={() => { setSelectedUserModalOpen(false) }}
			PaperProps={{
				style: {
					backgroundColor: theme.palette.surfaceColor,
					color: "white",
					minWidth: "800px",
					minHeight: "320px",
				},
			}}
		>
			<DialogTitle><span style={{ color: "white" }}>Edit user</span></DialogTitle>
			<DialogContent>
				<div style={{ display: "flex" }}>
					<TextField
						style={{ marginTop: 0, backgroundColor: theme.palette.inputColor, flex: 3 }}
						InputProps={{
							style: {
								height: 50,
								color: "white",
							},
						}}
						color="primary"
						required
						fullWidth={true}
						placeholder="New password"
						type="password"
						id="standard-required"
						autoComplete="password"
						margin="normal"
						variant="outlined"
						onChange={e => setNewPassword(e.target.value)}
					/>
					<Button
						style={{ maxHeight: 50, flex: 1 }}
						variant="outlined"
						color="primary"
						onClick={() => onPasswordChange()}
					>
						Submit
					</Button>
				</div>
				<Divider style={{ marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor }} />
				<Button
					style={{}}
					variant="outlined"
					color="primary"
					onClick={() => deleteUser(selectedUser)}
				>
					{selectedUser.active ? "Deactivate" : "Activate"}
				</Button>
				<Button
					style={{}}
					variant="outlined"
					color="primary"
					onClick={() => generateApikey(selectedUser.id)}
				>
					Get new API key
				</Button>
			</DialogContent>
		</Dialog>

	const GridItem = (props) => {
		const [expanded, setExpanded] = React.useState(false)

		const primary = props.data.primary
		const secondary = props.data.secondary
		const primaryIcon = props.data.icon
		const secondaryIcon = props.data.active ? 
			<CheckCircleIcon style={{color: "green"}} /> 
			: 
			<CloseIcon style={{color: "red"}} />

		return (
			<Grid item xs={4} style={{cursor: "pointer"}} onClick={() => {
				setExpanded(!expanded)	
			}}>
				<Card style={{margin: 4, backgroundColor: theme.palette.inputColor, color: "white", minHeight: expanded ? 200 : "inherit", maxHeight: expanded ? 200 : "inherit",}}>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								{primaryIcon}
							</Avatar>
						</ListItemAvatar>
						<ListItemText 
							style={{textTransform: "capitalize"}}
							primary={primary} 
						/>
						{secondaryIcon}		
					</ListItem>
					{expanded ?
						<div style={{padding: 15}}>
							<Typography>
								Usage: {props.data.limit === 0 ? "Infinite" : <span>{props.data.usage} / {props.data.limit}</span>}
							</Typography>
							<Typography>
								Data sharing: {props.data.data_collection} 
							</Typography>
							<Typography>
								Description: {secondary}
							</Typography>
						</div>
					: null}
				</Card>
			</Grid>
		)
	}

	const itemColor = "black"
	var syncList = [
		{
			"primary": "Workflows",
			"secondary": "",
			"active": true,
			"icon": <PolymerIcon style={{color: itemColor}}/>,
		},
		{
			"primary": "Apps",
			"secondary": "",
			"active": true,
			"icon": <AppsIcon style={{color: itemColor}}/>,
		},	
		{
			"primary": "Organization",
			"secondary": "",
			"active": true,
			"icon": <BusinessIcon style={{color: itemColor}}/>,
		},	
	]

	const cloudSyncModal =
		<Dialog 
			open={cloudSyncModalOpen}
			onClose={() => { setCloudSyncModalOpen(false) }}
			PaperProps={{
				style: {
					backgroundColor: theme.palette.surfaceColor,
					color: "white",
					minWidth: "800px",
					minHeight: "320px",
				},
			}}
		>
			<DialogTitle><span style={{ color: "white" }}>
				Enable cloud features
			</span></DialogTitle>
			<DialogContent>
				What does <a href="https://shuffler.io/docs/organizations#cloud_sync" target="_blank" style={{textDecoration: "none", color: "#f85a3e"}}>cloud sync</a> do?
				<div style={{display: "flex", marginBottom: 20, }}>
					<TextField
						color="primary"
						style={{backgroundColor: theme.palette.inputColor, marginRight: 10, }}
						InputProps={{
							style: {
								height: "50px",
								color: "white",
								fontSize: "1em",
							},
						}}
						required
						fullWidth={true}
						disabled={selectedOrganization.cloud_sync}
						autoComplete="cloud apikey"
						id="apikey_field"
						margin="normal"
						placeholder="Cloud Apikey"
						variant="outlined"
						onChange={(event) => {
							setCloudSyncApikey(event.target.value)
						}}
					/>
					<Button disabled={(!selectedOrganization.cloud_sync && cloudSyncApikey.length === 0) || loading} variant="contained" style={{ marginLeft: 15, height: 50, borderRadius: "0px" }} onClick={() => {
						setLoading(true)
						enableCloudSync(
							cloudSyncApikey,
							selectedOrganization,
							selectedOrganization.cloud_sync,
						)
					}} color="primary">
						{selectedOrganization.cloud_sync ? 
							"Stop sync"
							:
							"Start sync"
						}
					</Button>
				</div>
				{orgSyncResponse.length > 0 ? 
					<Typography style={{marginTop: 5, marginBottom: 10}}>
						Error: {orgSyncResponse}
					</Typography>
					: null
				}

			<Grid container style={{width: "100%", marginBottom: 15, }}>
				{syncList.map((data, index) => {
					return (
						<GridItem key={index} data={data} />
					)
				})}
			</Grid>

				* New triggers (userinput, hotmail realtime)<div/>
				* Execute in the cloud rather than onprem<div/>
				* Apps can be built in the cloud<div/>
				*	Easily share apps and workflows<div/>
				*	Access to powerful cloud search
			</DialogContent>
		</Dialog>	

	const cancelSubscriptions = (subscription_id) => {
		console.log(selectedOrganization)
		const data = {
			"subscription_id": subscription_id,
			"action": "cancel",
			"org_id": selectedOrganization.id,
		}


		const url = globalUrl + `/api/v1/orgs/${selectedOrganization.id}`;
		fetch(url, {
			mode: 'cors',
			method: 'POST',
			body: JSON.stringify(data),
			credentials: 'include',
			crossDomain: true,
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		})
		.then(function(response) {
			if (response.status !== 200) {
				console.log("Error in response")
			}

			handleGetOrg(selectedOrganization.id) 
			return response.json();
		}).then(function(responseJson) {	
			if (responseJson.success !== undefined && responseJson.success) {
				alert.success("Successfully stopped subscription!")


			} else {
				alert.error("Failed stopping subscription. Please contact us.")
			}
		})
		.catch(function(error) {
			console.log("Error: ", error)
			alert.error("Failed stopping subscription. Please contact us.")
		})
	}

	const organizationView = curTab === 0 && selectedOrganization.id !== undefined ?
		<div>
			<div style={{ marginTop: 20, marginBottom: 20, }}>
				<h2 style={{ display: "inline", }}>Organization overview</h2>
				<span style={{ marginLeft: 25 }}>
					On this page you can configure individual parts of your organization. <a target="_blank" href="https://shuffler.io/docs/organizations#organization" style={{textDecoration: "none", color: "#f85a3e"}}>Learn more</a>
				</span>
			</div>
				{selectedOrganization.id === undefined ? 
					<div style={{height: 250}}/>
					: 
					<div>
						{selectedOrganization.name.length > 0 ?
							<OrgHeader setSelectedOrganization={setSelectedOrganization} globalUrl={globalUrl} selectedOrganization={selectedOrganization}/>
						: null}
					<Divider style={{ marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor }} />
						<Typography variant="h6" style={{marginBottom: "10px", color: "white"}}>Cloud syncronization</Typography>
							What does <a href="https://shuffler.io/docs/organizations#cloud_sync" target="_blank" style={{textDecoration: "none", color: "#f85a3e"}}>cloud sync</a> do? Cloud syncronization is a way of getting more out of Shuffle. Shuffle will <b>ALWAYS</b> make every option open source, but features relying on other users can't be done without a collaborative approach.

					{isCloud ? 
						<div style={{marginTop: 15, display: "flex"}}>
							<div style={{flex: 1}}>
								<Typography style={{}}>
									Currently syncronizing: {selectedOrganization.cloud_sync_active === true ? "True" : "False"}
								</Typography>
								{selectedOrganization.cloud_sync_active ? 
									<Typography style={{}}>
										Syncronization interval: {selectedOrganization.sync_config.interval === 0 ? "60" : selectedOrganization.sync_config.interval}
									</Typography>
									: 
									null
								}
								<Typography style={{whiteSpace: "nowrap", marginTop: 25, marginRight: 10}}>
									Your Apikey 
								</Typography>
								<TextField
									color="primary"
									style={{backgroundColor: theme.palette.inputColor, }}
									InputProps={{
										style: {
											height: "50px",
											color: "white",
											fontSize: "1em",
										},
									}}
									required
									fullWidth={true}
									disabled={true}
									autoComplete="cloud apikey"
									id="apikey_field"
									margin="normal"
									placeholder="Cloud Apikey"
									variant="outlined"
									defaultValue={userSettings.apikey}
								/>
							</div>
						</div>
					:
					<div>
							<div style={{display: "flex", marginBottom: 20, }}>
								<TextField
									color="primary"
									style={{backgroundColor: theme.palette.inputColor, marginRight: 10, }}
									InputProps={{
										style: {
											height: "50px",
											color: "white",
											fontSize: "1em",
										},
									}}
									required
									fullWidth={true}
									disabled={selectedOrganization.cloud_sync}
									autoComplete="cloud apikey"
									id="apikey_field"
									margin="normal"
									placeholder="Cloud Apikey"
									variant="outlined"
									onChange={(event) => {
										setCloudSyncApikey(event.target.value)
									}}
								/>
								<Button disabled={(!selectedOrganization.cloud_sync && cloudSyncApikey.length === 0) || loading} variant="contained" style={{marginTop: 15, height: 50, width: 150,}} onClick={() => {
									setLoading(true)
									enableCloudSync(
										cloudSyncApikey,
										selectedOrganization,
										selectedOrganization.cloud_sync,
									)
								}} color="primary">
									{selectedOrganization.cloud_sync ? 
										"Stop sync"
										:
										"Start sync"
									}
								</Button>
							</div>
							{orgSyncResponse.length > 0 ? 
								<Typography style={{marginTop: 5, marginBottom: 10}}>
									Message from Shuffle: <b>{orgSyncResponse}</b>
								</Typography>
								: null
							}
						</div>
					}
					<Typography style={{marginTop: 40, marginLeft: 10, marginBottom: 5,}}>Cloud sync features</Typography>
					<Grid container style={{width: "100%", marginBottom: 15, }}>
						{Object.keys(selectedOrganization.sync_features).map(function(key, index) {
							if (key === "schedule") {
								return null
							}

							const item = selectedOrganization.sync_features[key]
							const newkey = key.replace("_", " ")
							const griditem = {
								"primary": newkey,
								"secondary": item.description === undefined || item.description === null || item.description.length === 0 ? "Not defined yet" : item.description,
								"limit": item.limit,
								"usage": 0, 
								"data_collection": "None",
								"active": item.active,
								"icon": <PolymerIcon style={{color: itemColor}}/>,
							}

							return (
								<Zoom key={index} >
									<GridItem data={griditem} />
								</Zoom>
							)
						})}
					</Grid>
					<Divider style={{ marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor }} />
					{isCloud && selectedOrganization.subscriptions !== null && selectedOrganization.subscriptions.length > 0 ? 
						<div style={{marginTop: 30, marginBottom: 20}}>
							<Typography style={{marginTop: 40, marginLeft: 10, marginBottom: 5,}}>
								Your subscription{selectedOrganization.subscriptions.length > 1 ? "s" : ""}
							</Typography>
							<Grid container spacing={3} style={{marginTop: 15}}>
								{selectedOrganization.subscriptions.reverse().map((sub, index) => {
									return (
										<Grid item key={index} xs={4}>
											<Card elevation={6} style={{backgroundColor: theme.palette.inputColor, color: "white", padding: 25, textAlign: "left",}}>
													<b>Type</b>: {sub.level}<div/>
													<b>Recurrence</b>: {sub.recurrence}<div/>
													{sub.active ? 
														<div>
															<b>Started</b>: {new Date(sub.startdate*1000).toISOString()}<div/>
															<Button variant="outlined" color="primary" style={{marginTop: 15}} onClick={() => {
																cancelSubscriptions(sub.reference) 
															}}>
																Cancel subscription
															</Button>
														</div>
														: 
														<div>
															<b>Cancelled</b>: {new Date(sub.cancellationdate*1000).toISOString()}<div/>
															<Typography color="textSecondary">
																<b>Status</b>: Deactivated
															</Typography>
														</div>
													}
											</Card>
										</Grid>
									)
							})}
						</Grid>
							<Divider style={{ marginTop: 20, backgroundColor: theme.palette.inputColor }} />
						</div>
						: null
					}
				</div>
				}

					<div style={{backgroundColor: "#1f2023", paddingTop: 25,}}>
						<HandlePayment stripeKey={props.stripeKey} userdata={userdata} globalUrl={globalUrl} {...props} />
					</div>
			</div>
		: null

	const modalView =
		<Dialog 
			open={modalOpen}
			onClose={() => { setModalOpen(false) }}
			PaperProps={{
				style: {
					backgroundColor: theme.palette.surfaceColor,
					color: "white",
					minWidth: "800px",
					minHeight: "320px",
				},
			}}
		>
			<DialogTitle><span style={{ color: "white" }}>
				{curTab === 1 ? "Add user" : "Add environment"}
			</span></DialogTitle>
			<DialogContent>
				{curTab === 1 ?
					<div>
						Username
						<TextField
							color="primary"
							style={{ backgroundColor: theme.palette.inputColor }}
							autoFocus
							InputProps={{
								style: {
									height: "50px",
									color: "white",
									fontSize: "1em",
								},
							}}
							required
							fullWidth={true}
							autoComplete="username"
							placeholder="username@example.com"
							id="emailfield"
							margin="normal"
							variant="outlined"
							onChange={(event) => changeModalData("Username", event.target.value)}
						/>
						Password
						<TextField
							color="primary"
							style={{ backgroundColor: theme.palette.inputColor }}
							InputProps={{
								style: {
									height: "50px",
									color: "white",
									fontSize: "1em",
								},
							}}
							required
							fullWidth={true}
							autoComplete="password"
							type="password"
							placeholder="********"
							id="pwfield"
							margin="normal"
							variant="outlined"
							onChange={(event) => changeModalData("Password", event.target.value)}
						/>
					</div>
					: curTab === 3 ?
						<div>
							Environment Name
					<TextField
								color="primary"
								style={{ backgroundColor: theme.palette.inputColor }}
								autoFocus
								InputProps={{
									style: {
										height: "50px",
										color: "white",
										fontSize: "1em",
									},
								}}
								required
								fullWidth={true}
								placeholder="datacenter froglantern"
								id="environment_name"
								margin="normal"
								variant="outlined"
								onChange={(event) => changeModalData("environment", event.target.value)}
							/>
						</div>
						: null}
				{loginInfo}
			</DialogContent>
			<DialogActions>
				<Button style={{ borderRadius: "0px" }} onClick={() => setModalOpen(false)} color="primary">
					Cancel
				</Button>
				<Button variant="contained" style={{ borderRadius: "0px" }} onClick={() => {
					if (curTab === 1) {
						submitUser(modalUser)
					} else if (curTab === 3) {
						submitEnvironment(modalUser)
					}
				}} color="primary">
					Submit
				</Button>
			</DialogActions>
		</Dialog>

	const usersView = curTab === 1 ?
		<div>
			<div style={{ marginTop: 20, marginBottom: 20, }}>
				<h2 style={{ display: "inline", }}>User management</h2>
				<span style={{ marginLeft: 25 }}>Add, edit, block or change passwords. <a target="_blank" href="https://shuffler.io/docs/organizations#user_management" style={{textDecoration: "none", color: "#f85a3e"}}>Learn more</a></span>
			</div>
			<div />
			<Button
				style={{}}
				variant="contained"
				color="primary"
				onClick={() => setModalOpen(true)}
			>
				Add user
			</Button>
			<Divider style={{ marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor }} />
			<List>
				<ListItem>
					<ListItemText
						primary="Username"
						style={{ minWidth: 200, maxWidth: 200 }}
					/>
					
					<ListItemText
						primary="API key"
						style={{ minWidth: 350, maxWidth: 350, overflow: "hidden" }}
					/>
					
					<ListItemText
						primary="Role"
						style={{ minWidth: 150, maxWidth: 150 }}
					/>
					<ListItemText
						primary="Active"
						style={{ minWidth: 180, maxWidth: 180 }}
					/>
					<ListItemText
						primary="Actions"
						style={{ minWidth: 180, maxWidth: 180 }}
					/>
				</ListItem>
				{users === undefined ? null : users.map((data, index) => {
					return (
						<ListItem key={index}>
							<ListItemText
								primary={data.username}
								style={{ minWidth: 200, maxWidth: 200 }}
							/>
							
							<ListItemText
								primary={data.apikey === undefined || data.apikey.length === 0 ? "" : data.apikey}
								style={{ maxWidth: 350, minWidth: 350, }}
							/>
							
							<ListItemText
								primary=
								{<Select
									SelectDisplayProps={{
									style: {
										marginLeft: 10,
									}
								}}
								value={data.role}
								fullWidth
								onChange={(e) => {
								console.log("VALUE: ", e.target.value)
								setUser(data.id, "role", e.target.value)
							}}
										style={{ backgroundColor: theme.palette.surfaceColor, color: "white", height: "50px" }}
										>
							<MenuItem style={{ backgroundColor: theme.palette.inputColor, color: "white" }} value={"admin"}>
								Admin
										</MenuItem>
							<MenuItem style={{ backgroundColor: theme.palette.inputColor, color: "white" }} value={"user"}>
								User
										</MenuItem>
									</Select>}
								style = {{ minWidth: 150, maxWidth: 150}}
							/>
							<ListItemText
					primary={data.active ? "True" : "False"}
					style={{ minWidth: 180, maxWidth: 180 }}
				/>
				<ListItemText style={{ display: "flex" }}>
					<Button
						style={{}}
						variant="outlined"
						color="primary"
						onClick={() => {
							setSelectedUserModalOpen(true)
							setSelectedUser(data)
						}}
					>
						Edit user
					</Button>
					<Button
						style={{}}
						variant="outlined"
						color="primary"
						onClick={() => generateApikey(data.id)}
					>
						Get new API key
					</Button>
					</ListItemText>
				</ListItem>
					)
				})}
			</List>
		</div>
		: null

	const schedulesView = curTab === 4 ?
		<div>
			<div style={{marginTop: 20, marginBottom: 20,}}>
				<h2 style={{display: "inline",}}>Schedules</h2>
				<span style={{marginLeft: 25}}>Schedules used in Workflows. Makes locating and control easier. <a target="_blank" href="https://shuffler.io/docs/organizations#schedules" style={{textDecoration: "none", color: "#f85a3e"}}>Learn more</a></span>
			</div>
			<Divider style={{marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor}}/>
			<List>
				<ListItem>
					<ListItemText
						primary="Interval"
						style={{maxWidth: 200, minWidth: 200}}
					/>
					<ListItemText
						primary="Environment"
						style={{maxWidth: 150, minWidth: 150}}
					/>
					<ListItemText
						primary="Workflow"
						style={{maxWidth: 315, minWidth: 315}}
					/>
					<ListItemText
						primary="Argument"
						style={{minWidth: 300, maxWidth: 300, overflow: "hidden"}}
					/>
					<ListItemText
						primary="Actions"
					/>
				</ListItem>
				{schedules === undefined || schedules === null ? null : schedules.map((schedule, index) => {
					return (
						<ListItem key={index}>
							<ListItemText
								style={{maxWidth: 200, minWidth: 200}}
								primary={schedule.environment === "cloud" ? schedule.frequency : <span>{schedule.seconds} seconds</span>}
							/>
							<ListItemText
								style={{maxWidth: 150, minWidth: 150}}
								primary={schedule.environment}
							/>
							<ListItemText
								style={{maxWidth: 315, minWidth: 315}}
								primary={<a style={{textDecoration: "none", color: "#f85a3e"}} href={`/workflows/${schedule.workflow_id}`} target="_blank">{schedule.workflow_id}</a>}
							/>
							<ListItemText
								primary={schedule.argument}
								style={{minWidth: 300, maxWidth: 300, overflow: "hidden"}}
							/>
							<ListItemText>
								<Button 
									style={{}} 
									variant="contained"
									color="primary"
									onClick={() => deleteSchedule(schedule)}
								>
									Stop schedule	
								</Button>
							</ListItemText>
						</ListItem>
					)
				})}
			</List>
		</div>
		: null

	const appCategoryView = curTab === 7 ?
		<div>
			<div style={{marginTop: 20, marginBottom: 20,}}>
				<h2 style={{display: "inline",}}>Categories</h2>
				<span style={{marginLeft: 25}}>
					Categories are the categories supported by Shuffle, which are mapped to apps and workflows	
				</span>
			</div>
			<Divider style={{marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor}}/>
			<List>
				<ListItem>
					<ListItemText
						primary="Category"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Apps"
						style={{minWidth: 250, maxWidth: 250}}
					/>
					<ListItemText
						primary="Workflows"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Authentication"
						style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
					/>
					<ListItemText
						primary="Actions"
						style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
					/>
				</ListItem>
				{categories.map(data => {
					if (data.apps.length === 0) {
						return null
					}

					return (
						<ListItem>
							<ListItemText
								primary={data.name}
								style={{minWidth: 150, maxWidth: 150}}
							/>
							<ListItemText
								primary={""}
								style={{minWidth: 250, maxWidth: 250}}
							/>
							<ListItemText
								primary={""}
								style={{minWidth: 150, maxWidth: 150}}
							/>
							<ListItemText
								primary={""}
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
							/>
							<ListItemText
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
							>
								<Button 
									style={{}} 
									variant="outlined"
									color="primary"
									onClick={() => {
										console.log("Show apps with this category")
									}}
								>
									Find app ({data.apps === null ? 0 : data.apps.length})
								</Button>
							</ListItemText>
						</ListItem>
					)
				})}
			</List>
		</div>
		: null

	const authenticationView = curTab === 2 ?
		<div>
			<div style={{marginTop: 20, marginBottom: 20,}}>
				<h2 style={{display: "inline",}}>App Authentication</h2>
				<span style={{marginLeft: 25}}>Control the authentication options for individual apps. <b>Actions can be destructive!</b></span>
				 .&nbsp;<a target="_blank" href="https://shuffler.io/docs/organizations#app_authentication" style={{textDecoration: "none", color: "#f85a3e"}}>Learn more</a>
			</div>
			<Divider style={{marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor}}/>
			<List>
				<ListItem>
					<ListItemText
						primary="Icon"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Label"
						style={{minWidth: 250, maxWidth: 250}}
					/>
					<ListItemText
						primary="App Name"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Workflows"
						style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
					/>
					<ListItemText
						primary="Action amount"
						style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
					/>
					<ListItemText
						primary="Fields"
						style={{minWidth: 200, maxWidth: 200, overflow: "hidden"}}
					/>
					<ListItemText
						primary="Actions"
					/>
				</ListItem>
				{authentication === undefined ? null : authentication.map((data, index) => {
					return (
						<ListItem key={index}>
							<ListItemText
								primary=<img alt="" src={data.app.large_image} style={{maxWidth: 50,}} />
								style={{minWidth: 150, maxWidth: 150}}
							/>
							<ListItemText
								primary={data.label}
								style={{minWidth: 250, maxWidth: 250}}
							/>
							<ListItemText
								primary={data.app.name}
								style={{minWidth: 150, maxWidth: 150}}
							/>
							<ListItemText
								primary={data.usage === null ? 0 : data.usage.length}
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
							/>
							<ListItemText
								primary={data.node_count}
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
							/>
							<ListItemText
								primary={data.fields.map(data => {
									return data.key
								}).join(", ")}
								style={{minWidth: 200, maxWidth: 200, overflow: "hidden"}}
							/>
							<ListItemText>
								<Button 
									style={{}} 
									variant="outlined"
									color="primary"
									onClick={() => {
										deleteAuthentication(data)
									}}
								>
									Delete	
								</Button>
							</ListItemText>
						</ListItem>
					)
				})}
			</List>
		</div>
		: null

	const environmentView = curTab === 3 ?
		<div>
			<div style={{marginTop: 20, marginBottom: 20,}}>
				<h2 style={{display: "inline",}}>Environments</h2>
				<span style={{marginLeft: 25}}>Decides what Orborus environment to execute an action in a workflow in.<a target="_blank" href="https://shuffler.io/docs/organizations#environments" style={{textDecoration: "none", color: "#f85a3e"}}>Learn more</a></span>
			</div>
			<Button 
				style={{}} 
				variant="contained"
				color="primary"
				onClick={() => setModalOpen(true)}
			> 
				Add environment 
			</Button>
			<Button 
				style={{marginLeft: 5, marginRight: 15, }} 
				variant="contained"
				color="primary"
				onClick={() => getEnvironments()}
			> 
				<CachedIcon />
			</Button>
			<Switch checked={showArchived} onChange={() => {setShowArchived(!showArchived)}} />	Show archived
			<Divider style={{marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor}}/>
			<List>
				<ListItem>
					<ListItemText
						primary="Name"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Orborus running (TBD)"
						style={{minWidth: 200, maxWidth: 200}}
					/>
					<ListItemText
						primary="Type"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Default"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Actions"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Archived"
						style={{minWidth: 150, maxWidth: 150}}
					/>
				</ListItem>
				{environments === undefined || environments === null ? null : environments.map((environment, index)=> {
					if (!showArchived && environment.archived) {
						return null	
					}

					if (environment.archived === undefined) {
						getEnvironments()
						return null
					}

					return (
						<ListItem key={index}>
							<ListItemText
								primary={environment.Name}
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
							/>
							<ListItemText
								primary={environment.Type === "cloud" ? "N/A" : "TBD"}
								style={{minWidth: 200, maxWidth: 200, overflow: "hidden"}}
							/>
							<ListItemText
								primary={environment.Type}
								style={{minWidth: 150, maxWidth: 150}}
							/>
							<ListItemText
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
								primary={environment.default ? "true" : null}
							>
								{environment.default ? 
									null
									: 
									<Button variant="outlined" style={{borderRadius: "0px"}} onClick={() => setDefaultEnvironment(environment.Name)} color="primary">Set default</Button>
								}
							</ListItemText>
							<ListItemText
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
							>
								<Button disabled={environment.archived} variant="outlined" style={{borderRadius: "0px"}} onClick={() => deleteEnvironment(environment.Name)} color="primary">Archive</Button>
							</ListItemText>
							<ListItemText
								style={{minWidth: 150, maxWidth: 150, overflow: "hidden"}}
								primary={environment.archived.toString()}
							/>
						</ListItem>
					)
				})}
			</List>
		</div>
		: null

	const organizationsTab = curTab === 6 ?
		<div>
			<div style={{marginTop: 20, marginBottom: 20,}}>
				<h2 style={{display: "inline",}}>Organizations</h2>
				<span style={{marginLeft: 25}}>Global admin: control organizations</span>
			</div>
			<Button 
				style={{}} 
				variant="contained"
				color="primary"
				disabled
				onClick={() => {
					setModalOpen(true)
				}}
			> 
				Add organization 
			</Button>
			<Divider style={{marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor}}/>
			<List>
				<ListItem>
					<ListItemText
						primary="Name"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="id"
						style={{minWidth: 200, maxWidth: 200}}
					/>
					<ListItemText
						primary="Your role"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Selected"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Cloud Sync"
						style={{minWidth: 150, maxWidth: 150}}
					/>
				</ListItem>
				{organizations !== undefined && organizations !== null && organizations.length > 0 ? 
					<span>
						{organizations.map((data, index) => {
							const isSelected = props.userdata.active_org.id === undefined ? "False" : props.userdata.active_org.id === data.id ? "True" : "False"

							return (
								<ListItem key={index}>
									<ListItemText
										primary={data.name}
										style={{minWidth: 150, maxWidth: 150}}
									/>
									<ListItemText
										primary={data.id}
										style={{minWidth: 200, maxWidth: 200}}
									/>
									<ListItemText
										primary={data.role}
										style={{minWidth: 150, maxWidth: 150}}
									/>
									<ListItemText
										primary={isSelected}
										style={{minWidth: 150, maxWidth: 150}}
									/>
									<ListItemText
										primary=<Switch checked={data.cloud_sync} onChange={() => {
											setCloudSyncModalOpen(true)
											setSelectedOrganization(data)
											console.log("INVERT CLOUD SYNC")
										}} />
										style={{minWidth: 150, maxWidth: 150}}
									/>
								</ListItem>
							)
						})}
					</span>
				: null}
			</List>
		</div>
		: null

	const hybridTab = curTab === 5 ?
		<div>
			<div style={{marginTop: 20, marginBottom: 20,}}>
				<h2 style={{display: "inline",}}>Hybrid</h2>
				<span style={{marginLeft: 25}}></span>
			</div>
			<Divider style={{marginTop: 20, marginBottom: 20, backgroundColor: theme.palette.inputColor}}/>
			<List>
				<ListItem>
					<ListItemText
						primary="Name"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="Orborus running (TBD)"
						style={{minWidth: 200, maxWidth: 200}}
					/>
					<ListItemText
						primary="Actions"
						style={{minWidth: 150, maxWidth: 150}}
					/>
				</ListItem>
				<ListItem>
					<ListItemText
						primary="Enabled"
						style={{minWidth: 150, maxWidth: 150}}
					/>
					<ListItemText
						primary="false"
						style={{minWidth: 200, maxWidth: 200}}
					/>
					<ListItemText
						primary=<Switch checked={false} onChange={() => {console.log("INVERT")}} />
						style={{minWidth: 150, maxWidth: 150}}
					/>
				</ListItem>
			</List>
		</div>
		: null

		// primary={environment.Registered ? "true" : "false"}

	const setConfig = (event, newValue) => {
		if (newValue === 1) {
			getUsers()
		} else if (newValue === 2) {
			getAppAuthentication()
		} else if (newValue === 3) {
			getEnvironments()
		} else if (newValue === 4) {
			getSchedules()
		} else if (newValue === 6) {
			getOrgs() 
		}

		if (newValue === 6) {
			console.log("Should get apps for categories.")
		}

		const views = {
			0: "organization",
			1: "users",
			2: "app_auth",
			3: "environments",
			4: "schedules",
			5: "categories",
		}

		//var theURL = window.location.pathname
		//FIXME: Add url edits
		//var theURL = window.location
		//theURL.replace(`/${views[curTab]}`, `/${views[newValue]}`)
		//window.history.pushState({"html":response.html,"pageTitle":response.pageTitle},"", urlPath);

		//console.log(newpath)
		//window.location.pathame = newpath

		setModalUser({})
		setCurTab(newValue)
	}

	const iconStyle = {marginRight: 10}
	const data = 
		<div style={{minWidth: 1366, margin: "auto"}}>
			<Paper style={paperStyle}>
				<Tabs
					value={curTab}
					indicatorColor="primary"
					onChange={setConfig}
					aria-label="disabled tabs example"
				>
					<Tab label=<span><BusinessIcon style={iconStyle} /> Organization</span>/>
					{isCloud ? null : <Tab label=<span><AccessibilityNewIcon style={iconStyle} />Users</span> />}
					{isCloud ? null : <Tab label=<span><LockIcon style={iconStyle} />App Authentication</span>/>}
					{isCloud ? null : <Tab label=<span><EcoIcon style={iconStyle} />Environments</span>/>}
					{isCloud ? null : <Tab label=<span><ScheduleIcon style={iconStyle} />Schedules</span> />}
					{window.location.protocol == "http:" && window.location.port === "3000" ? <Tab label=<span><CloudIcon style={iconStyle} /> Hybrid</span>/> : null}
					{window.location.protocol == "http:" && window.location.port === "3000" ? <Tab label=<span><BusinessIcon style={iconStyle} /> Organizations</span>/> : null}
					{window.location.protocol === "http:" && window.location.port === "3000" ? <Tab label=<span><LockIcon style={iconStyle} />Categories</span>/> : null}
				</Tabs>
				<Divider style={{marginTop: 0, marginBottom: 10, backgroundColor: "rgb(91, 96, 100)"}} />
				<div style={{padding: 15}}>
					{organizationView}
					{authenticationView}
					{appCategoryView}
					{usersView}	
					{environmentView}
					{schedulesView}
					{hybridTab}
					{organizationsTab}
				</div>
			</Paper>
		</div>

	return (
		<div>
			{modalView}
			{cloudSyncModal}
			{editUserModal}
			{editAuthenticationModal}
			{data}
		</div>
	)
}

export default Admin 
