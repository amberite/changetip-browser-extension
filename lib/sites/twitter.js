addModule('twitter', function(module, moduleID) {
	module.moduleName = 'Twitter';
	module.category = 'Site Modules';

	module.init = function() {
		$("#page-container").delegate(".js-actionable-tweet", "mouseover", function() {
			var replyAction,
				changeTipButton,
				bgImgURL = chrome.extension.getURL('images/changetip_twitter_icon.png'),
				link,
				username,
				button,
				buttonImg;

			if (!$(this).data('changetip-button-added')) {
				replyAction = $(this).find("div.ProfileTweet-action--reply");
				if (replyAction) {
					changeTipButton = replyAction.clone();

					username = replyAction.closest('.content').find('.username').text();
					console.log(username);

					button = changeTipButton.find(".js-actionReply");
					button.empty();
					buttonImg = $('<img width="16" height="16" src="'+bgImgURL+'">');
					button.append(buttonImg);

					button.addClass("js-actionChangeTip")
							.removeAttr("data-modal")
							.attr("title", "ChangeTip");

					button.find(".Icon").removeClass("Icon--reply");
					button.find(".u-isHiddenVisually").html("ChangeTip");

					button.attr('data-username', username);
					button.on("click", module.delayedTipViaReply);

					link = changeTipButton.find(".js-actionCount");
					link.removeClass("ProfileTweet-actionCount--isZero");
					link.attr("title", "ChangeTip");
					link.find("span").html("Tip");
					link.on("click", module.delayedTipViaReply);

					replyAction.after(changeTipButton);
				}
			}
			$(this).data('changetip-button-added', true);
		});
	};

	// the string used to mention changetip on this medium
	module.ctMentionString = '@changetip';

	/**
	 * given a tip amount, return a message string to be appended
	 * to the comment reply box using ChangeTip.applyTipTemplate
	 * 
	 * @return {string} message to be placed into comment box
	 */
	module.getTipMessage = function(tipAmount) {
		return ChangeTip.applyTipTemplate(tipAmount) + ' ' + module.ctMentionString;
	};

	/**
	 * handle form submission from the ChangTip dialog - this function
	 * should call module.getTipMessage, and place that message in to
	 * the appropriate place
	 */
	module.submit = function(tipAmount) {
		var tipString = module.getTipMessage(tipAmount),
			text;

		// focus the textarea immediately, because twitter is going to do some DOM swapping that
		// needs to happen before we attempt to manipulate the text.
		module.textarea.focus();
		
		// get the existing textcontent (filter out the HTML, as twitter will re-assemble it),
		// and append the tipString.
		text = module.textarea.textContent;

		// we add an extra space to the end to avoid the auto complete popups after the @mention
		text = text + tipString + ' ';

		module.textarea.innerHTML = text;
	};

	/**
	 * If the onCancel function exists, the core changeTip dialog will
	 * call it when the dialog is cancelled
	 */
	module.onCancel = function() {
		module.textarea.focus();
	};

	// we need the tip box to exist, so we'll wait for it...
	module.delayedTipViaReply = function(e) {
		var textarea = $(e.target).closest('.original-tweet-container').find('div.tweet-box.rich-editor');
		if (!textarea || !textarea.length) {
			setTimeout(function() {
				module.delayedTipViaReply(e);
			}, 100);
		} else {
			module.tipViaReply(e, textarea[0]);
		}
	};

	module.tipViaReply = function(e, textarea) {
		var tipButton = e.target,
			username;

		if (tipButton.tagName === 'IMG') {
			tipButton = tipButton.parentNode;
		} 
		username = tipButton.getAttribute('data-username');

		if (!textarea) {
			throw "ChangeTip Exception: comment textarea not found";
		}
		module.textarea = textarea;
		ChangeTip.openDialog({
			x: $(module.textarea).offset().left,
			y: $(module.textarea).offset().top,
			textarea: textarea,
			amount: ChangeTip.getSetting('defaultAmount'),
			username: username
		});
	};

});